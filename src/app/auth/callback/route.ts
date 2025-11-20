import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // パラメータに "next" がある場合、それをリダイレクト先URLとして使用します
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // ロードバランサー前の元のオリジン
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // ロードバランサーが間にないことが確実なため、X-Forwarded-Host を監視する必要はありません
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // 手順を記載したエラーページにユーザーを戻します
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
