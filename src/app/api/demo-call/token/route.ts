import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createHmac, createHash } from 'crypto'

/**
 * GET /api/demo-call/token
 * 
 * ログインユーザーに対して、HMAC署名付きトークンを発行。
 * WEB_DEMO_SHARED_SECRET で署名。
 * トークンに timestamp を埋め込み、期限判定は call-engine 側で行う（デフォルト5分 ±60秒の clock skew 許容）。
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const secret = process.env.WEB_DEMO_SHARED_SECRET
        const wsUrl = process.env.CALL_ENGINE_WS_URL

        if (!secret || !wsUrl) {
            console.error('WEB_DEMO_SHARED_SECRET or CALL_ENGINE_WS_URL not configured')
            return NextResponse.json(
                { error: 'Service not configured' },
                { status: 503 }
            )
        }

        // Debug: log sha256 of secret for cross-service verification (never log the actual secret)
        const secretHash = createHash('sha256').update(secret, 'utf8').digest('hex')
        console.log(`WEB_DEMO_SHARED_SECRET sha256=${secretHash} len=${secret.length}`)

        // Generate timestamp (seconds)
        const timestamp = Math.floor(Date.now() / 1000)

        // HMAC-SHA256 signature: hmac = HMAC-SHA256(secret, "${timestamp}.${userId}")
        const dataToSign = `${timestamp}.${user.id}`
        const signature = createHmac('sha256', secret)
            .update(dataToSign)
            .digest('hex')

        // Token format: base64url("${timestamp}.${userId}.${hmacHex}")
        const tokenData = `${timestamp}.${user.id}.${signature}`
        const token = Buffer.from(tokenData).toString('base64url')

        return NextResponse.json({
            token,
            wsUrl: `${wsUrl}/web-demo-media`,
            userId: user.id
        })

    } catch (error) {
        console.error('Demo call token API error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
