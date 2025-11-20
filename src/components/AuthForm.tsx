'use client'

import { useState } from 'react'
import { login, signup } from '@/app/login/actions'
import { Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react'

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMessage(null)
        const formData = new FormData(e.currentTarget)

        const result = isLogin ? await login(formData) : await signup(formData)

        if (result?.error) {
            setErrorMessage(result.error)
        }
    }

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        {isLogin ? (
                            <LogIn className="w-8 h-8 text-indigo-600" />
                        ) : (
                            <UserPlus className="w-8 h-8 text-indigo-600" />
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    {isLogin ? 'おかえりなさい' : 'アカウント作成'}
                </h2>
                <p className="text-center text-gray-500 mb-8">
                    {isLogin
                        ? 'アカウントにログインして続行'
                        : '新しいアカウントを作成して開始'}
                </p>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p className="font-bold">エラー</p>
                        <p>{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            メールアドレス
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 bg-white"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            パスワード
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 bg-white"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        {isLogin ? 'ログイン' : '登録する'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                または
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            {isLogin
                                ? 'アカウントをお持ちでない方はこちら'
                                : 'すでにアカウントをお持ちの方はこちら'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                    続行することで、利用規約とプライバシーポリシーに同意したことになります。
                </p>
            </div>
        </div>
    )
}
