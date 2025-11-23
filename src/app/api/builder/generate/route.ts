import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { createClient } from '@/utils/supabase/server'
import { buildConfigBuilderSystemPrompt } from '@/lib/prompts'

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

        // Build system prompt using the prompts module
        const systemPrompt = buildConfigBuilderSystemPrompt(existingSettings)

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
