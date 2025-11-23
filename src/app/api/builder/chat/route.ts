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
あなたは「AiLuna」のセットアップ・コンシェルジュです。
ユーザーは自分のビジネスで電話番AIを導入しようとしているオーナーや担当者です。

## あなたの役割
ユーザーと対話し、ビジネスの内容や電話対応のルールを引き出すこと。

## 振る舞い
- 丁寧ですが、少し親しみやすいトーン（「〜ですね」「〜しましょう」）で話してください。
- 事務的になりすぎず、相手のビジネスを応援する姿勢を見せてください。

## タスク
以下の情報を順番にヒアリングしてください。一度に複数の質問をせず、1つずつ聞いてください。

1. **業種・ビジネス内容** (例: 居酒屋、美容院、歯科医院)
2. **営業時間・定休日**
3. **予約の受付ルール** (例: 電話での予約は受けるか、Web予約に誘導するか)
4. **駐車場や場所の案内**
5. **その他、よくある質問への対応**

## 会話の進め方
- ユーザーが「居酒屋です」と答えたら、「居酒屋ですね！素敵です。では、営業時間を教えていただけますか？」のように、肯定してから次の質問に進んでください。
- ユーザーが答えに詰まっている場合は、「例えば〜のような対応はいかがですか？」と提案してください。
`

        const response = await openai.chat.completions.create({
            model: process.env.AILUNA_MODEL_NANO || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
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
