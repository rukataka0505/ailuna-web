import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
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
あなたは電話番設定のコンシェルジュです。
ユーザーは企業の担当者で、AI電話代行サービス「AiLuna」の設定を行おうとしています。
あなたの目的は、ユーザーから以下の情報をヒアリングし、最適な設定を提案することです。

1. 業種・ビジネスの内容
2. 電話に出た時の挨拶（会社名など）
3. よくある質問への回答方針（料金、営業時間、予約方法など）
4. AIの口調（丁寧、フレンドリーなど）

会話は自然な日本語で行ってください。
一度に全ての質問をせず、会話の流れに合わせて一つずつ聞いてください。
ユーザーが答えに詰まっている場合は、例を提示して誘導してください。
`

        const response = await openai.chat.completions.create({
            model: process.env.AILUNA_MODEL_NANO || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
        })

        return NextResponse.json({
            content: response.choices[0].message.content
        })

    } catch (error) {
        console.error('Chat API Error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
