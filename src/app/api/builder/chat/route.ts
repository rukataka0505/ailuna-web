import { OpenAI } from 'openai'
import { NextResponse } from 'next/server'
import { SETUP_CONCIERGE_SYSTEM_PROMPT } from '@/lib/prompts'

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

        const systemPrompt = SETUP_CONCIERGE_SYSTEM_PROMPT

        const response = await openai.chat.completions.create({
            model: process.env.AILUNA_MODEL_HIGH || 'gpt-5-mini',
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
