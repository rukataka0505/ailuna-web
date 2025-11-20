import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * 以下のパスで始まるものを除くすべてのリクエストパスに一致させます:
         * - _next/static (静的ファイル)
         * - _next/image (画像最適化ファイル)
         * - favicon.ico (ファビコンファイル)
         * 必要に応じてこのパターンを変更して、より多くのパスを含めることができます。
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
