import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 重要: createServerClient と supabase.auth.getUser() の間にロジックを記述することは避けてください。
    // 単純なミスでも、ユーザーがランダムにログアウトされる問題のデバッグが非常に困難になる可能性があります。

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/'
    ) {
        // ユーザーが存在しない場合、LP（トップページ）にリダイレクトします
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // 重要: supabaseResponse オブジェクトはそのまま返す必要があります。
    // NextResponse.next() で新しい Response オブジェクトを作成する場合は、以下の点に注意してください：
    // 1. 次のようにリクエストを渡します:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. 次のようにクッキーをコピーします:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. myNewResponse オブジェクトを必要に応じて変更しますが、クッキーは変更しないでください！
    // 4. 最後に:
    //    return myNewResponse
    // これが行われない場合、ブラウザとサーバーの同期がずれ、ユーザーのセッションが早期に終了する可能性があります！

    return supabaseResponse
}
