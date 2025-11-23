import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const ConfigSchema = z.object({
    system_prompt: z.string().describe('AI電話番として振る舞うためのシステムプロンプト。挨拶、ビジネス内容、ルールなどを統合した指示書。'),
    config_metadata: z.object({
        tone_label: z.string().describe('AIの口調（例: 丁寧、フレンドリー、カジュアル）'),
        sample_greeting: z.string().describe('電話に出た時の挨拶の例'),
        key_rules: z.array(z.string()).describe('抽出された重要なルール箇条書き'),
        business_type: z.string().optional().describe('業種'),
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

        const systemPrompt = `
あなたは電話番設定の生成AIです。
これまでのユーザーとの会話履歴をもとに、AI電話番のための「システムプロンプト」と「設定メタデータ」を生成してください。

## 生成のポイント
- system_prompt: AIが電話に出た際に、どのように振る舞うべきかを詳細に記述してください。会社名、サービス内容、Q&A対応などを網羅してください。
- config_metadata: UI表示用に、重要な情報を構造化して抽出してください。
`

        const completion = await openai.chat.completions.create({
            model: process.env.AILUNA_MODEL_HIGH || 'gpt-4o',
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
        if (result.config_metadata.tone_label.includes('フレンドリー')) tone = 'friendly'
        if (result.config_metadata.tone_label.includes('カジュアル') || result.config_metadata.tone_label.includes('フランク')) tone = 'casual'

        const formattedResult = {
            system_prompt: result.system_prompt,
            config_metadata: {
                tone,
                greeting_message: result.config_metadata.sample_greeting,
                business_description: '（自動生成された設定）', // 簡易的な値
                rules: result.config_metadata.key_rules,
                industry: result.config_metadata.business_type
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
