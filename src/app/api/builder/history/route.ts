import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const MAX_MESSAGES = 50

type Message = {
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { data, error } = await supabase
            .from('concierge_chat_history')
            .select('messages')
            .eq('user_id', user.id)
            .single()

        if (error) {
            // No history found is not an error - return empty array
            if (error.code === 'PGRST116') {
                return NextResponse.json({ messages: [] })
            }
            console.error('Error fetching chat history:', error)
            return NextResponse.json(
                { error: 'Failed to fetch chat history' },
                { status: 500 }
            )
        }

        return NextResponse.json({ messages: data?.messages || [] })

    } catch (error) {
        console.error('Chat history GET error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { messages } = await req.json()

        // Validate messages array
        if (!Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages must be an array' },
                { status: 400 }
            )
        }

        // Validate message structure
        for (const msg of messages) {
            if (!msg.role || !msg.content || !msg.timestamp) {
                return NextResponse.json(
                    { error: 'Invalid message structure. Each message must have role, content, and timestamp' },
                    { status: 400 }
                )
            }
            if (!['user', 'assistant'].includes(msg.role)) {
                return NextResponse.json(
                    { error: 'Invalid message role. Must be "user" or "assistant"' },
                    { status: 400 }
                )
            }
        }

        // Limit to most recent MAX_MESSAGES
        const limitedMessages = messages.slice(-MAX_MESSAGES)

        // Upsert chat history
        const { error } = await supabase
            .from('concierge_chat_history')
            .upsert(
                {
                    user_id: user.id,
                    messages: limitedMessages,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'user_id' }
            )

        if (error) {
            console.error('Error saving chat history:', error)
            return NextResponse.json(
                { error: 'Failed to save chat history' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Chat history POST error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
