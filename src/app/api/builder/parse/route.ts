import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { CONFIG_PARSER_SYSTEM_PROMPT } from '@/lib/prompts/configParser'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const parseSchema = z.object({
    system_prompt: z.string(),
})

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { system_prompt } = parseSchema.parse(body)

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: CONFIG_PARSER_SYSTEM_PROMPT },
                { role: 'user', content: system_prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
        })

        const content = completion.choices[0].message.content
        if (!content) {
            throw new Error('No content generated')
        }

        const parsedData = JSON.parse(content)

        // Map the parsed data to match ConfigMetadata structure if needed
        // The prompt is designed to output matching keys, but we ensure type safety here
        const config_metadata = {
            greeting_message: parsedData.greeting_message || '',
            tone: parsedData.tone || 'polite',
            business_description: parsedData.business_summary || '', // prompt uses business_summary, mapping to business_description
            rules: parsedData.key_rules || [],
            business_type: parsedData.business_type || ''
        }

        return NextResponse.json(config_metadata)
    } catch (error) {
        console.error('Parse error:', error)
        return NextResponse.json(
            { error: 'Failed to parse system prompt' },
            { status: 500 }
        )
    }
}
