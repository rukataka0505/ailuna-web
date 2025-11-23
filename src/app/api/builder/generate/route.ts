import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const ConfigSchema = z.object({
    system_prompt: z.string().describe('AI電話番として振る舞うための「あなたは〜です」から始まる完全なシステムプロンプト。挨拶、ビジネス内容、Q&A、ルールなどを統合した詳細な指示書。'),
    config_metadata: z.object({
        tone_label: z.string().describe('AIの口調（例: 元気な居酒屋店員、落ち着いた受付、フレンドリーなアシスタント）'),
        sample_greeting: z.string().describe('電話に出た時の第一声の挨拶（例: お電話ありがとうございます！〇〇です。）'),
        key_rules: z.array(z.string()).describe('抽出された重要なルールの箇条書き (3〜5個)'),
        business_type: z.string().describe('業種 (例: 居酒屋, 美容院, 歯科医院)'),
    }),
})

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API Key is not configured' },
                { status: 500 }
            )
        }

        // 既存の設定を取得（差分更新のため）
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        let existingSettings: { system_prompt: string | null; config_metadata: any } | null = null

        if (user) {
            const { data } = await supabase
                .from('user_prompts')
                .select('system_prompt, config_metadata')
                .eq('user_id', user.id)
                .single()

            existingSettings = data
        }

        // 既存設定がある場合は、差分更新として指示
        let systemPrompt = `
あなたは電話番設定の生成AIです。
これまでのユーザーとの会話履歴をもとに、AI電話番のための「システムプロンプト」と「設定メタデータ」を生成してください。
`

        if (existingSettings?.system_prompt || existingSettings?.config_metadata) {
            systemPrompt += `
## 重要: 既存設定の差分更新

**既存の設定が存在します。ユーザーの追加要望を既存設定に反映した「差分更新」として新しい設定を生成してください。**

### 既存のシステムプロンプト:
\`\`\`
${existingSettings.system_prompt || '（未設定）'}
\`\`\`

### 既存の設定メタデータ:
\`\`\`json
${JSON.stringify(existingSettings.config_metadata, null, 2) || '（未設定）'}
\`\`\`

**指示:**
- 既存の設定内容を基盤として、ユーザーの新しい要望や変更点のみを反映してください
- 変更されていない部分は既存の内容を維持してください
- ユーザーが明示的に変更を求めた部分のみを更新してください
`
        } else {
            systemPrompt += `
## 新規設定の生成

既存の設定が存在しないため、ゼロから新しい設定を作成してください。
`
        }

        systemPrompt += `
## 生成ルール【厳守】

### 情報源の制限
- **会話履歴に明示的に含まれている情報のみ**を使用すること
- **既存設定（system_prompt / config_metadata）に記載されている情報のみ**を使用すること
- 会話や既存設定に出ていない項目について、推測や一般的な想定で具体的な内容を書かないこと

### 禁止事項
- ❌ 営業時間・予約ルール・駐車場・料金・サービス内容など、会話で触れられていない具体的な情報を勝手に作らないこと
- ❌ Q&Aリストやサンプル対話を生成しないこと
- ❌ 「よくある質問」や「想定される問い合わせ」を推測して記載しないこと
- ❌ 会話に出ていない業種特有のルールや慣習を追加しないこと

### 不明な情報への対応
- 情報が不足している項目については、具体的な内容を書かないこと
- 許容されるのは「不明な点は確認して折り返す」などの**抽象的な安全方針の一文程度**のみ
- 具体的な時間・料金・サービス内容・個別ルールを勝手に作らないこと

### 生成のポイント
1. **system_prompt**:
   - 「あなたは[業種]の[店名/会社名]のAI電話番です。」から始める（会話で明示された場合のみ）
   - **挨拶**: 会話で指定された第一声のみを記載
   - **トーン**: 会話で希望された口調のみを反映
   - **ルール**: 会話で明示的にヒアリングされた内容のみを記載
   - **未定事項**: 具体的な指示は書かず、「詳細は確認して折り返す」程度の抽象的な方針のみ

2. **config_metadata**:
   - 会話から抽出できた情報のみを簡潔に要約
   - business_typeは会話で明示された場合のみ抽出
   - key_rulesは会話で触れられたルールのみを列挙（3〜5個程度、少なくても可）

### 結果の品質基準
- ✅ 短く実用的な指示書であること
- ✅ 会話で触れた内容だけが反映されていること
- ✅ 推測や想定で埋められた項目がないこと
`

        const completion = await openai.chat.completions.create({
            model: process.env.AILUNA_MODEL_HIGH || 'gpt-5-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            response_format: zodResponseFormat(ConfigSchema, 'agent_config'),
        })

        const content = completion.choices[0].message.content
        if (!content) {
            throw new Error('No content in response')
        }

        const result = JSON.parse(content)

        // ConfigMetadata型に合わせるための変換
        // tone_label を tone ('polite' | 'friendly' | 'casual') にマッピングする簡易ロジック
        let tone: 'polite' | 'friendly' | 'casual' = 'polite'
        const label = result.config_metadata.tone_label || ''
        if (label.includes('フレンドリー') || label.includes('元気') || label.includes('親しみ')) tone = 'friendly'
        if (label.includes('カジュアル') || label.includes('フランク') || label.includes('タメ口')) tone = 'casual'

        const formattedResult = {
            system_prompt: result.system_prompt,
            config_metadata: {
                tone,
                greeting_message: result.config_metadata.sample_greeting,
                business_description: `${result.config_metadata.business_type}のAI電話番`,
                rules: result.config_metadata.key_rules,
                business_type: result.config_metadata.business_type
            }
        }

        return NextResponse.json(formattedResult)

    } catch (error) {
        console.error('Generate API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
