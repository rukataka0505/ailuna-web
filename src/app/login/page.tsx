'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function LoginPage() {
    const supabase = createClient()
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    if (!origin) return null

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    アカウントにログイン
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        providers={[]}
                        redirectTo={`${origin}/auth/callback`}
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'メールアドレス',
                                    password_label: 'パスワード',
                                    button_label: 'ログイン',
                                    loading_button_label: 'ログイン中...',
                                    social_provider_text: '{{provider}}でログイン',
                                    link_text: 'アカウントをお持ちの方はこちら',
                                },
                                sign_up: {
                                    email_label: 'メールアドレス',
                                    password_label: 'パスワード',
                                    button_label: '登録する',
                                    loading_button_label: '登録中...',
                                    social_provider_text: '{{provider}}で登録',
                                    link_text: 'アカウントをお持ちでない方はこちら',
                                    confirmation_text: '確認メールを送信しました',
                                },
                                forgotten_password: {
                                    email_label: 'メールアドレス',
                                    button_label: 'パスワードリセットメールを送信',
                                    loading_button_label: '送信中...',
                                    link_text: 'パスワードをお忘れですか？',
                                    confirmation_text: 'パスワードリセットメールを送信しました',
                                },
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
