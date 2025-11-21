'use client'

import { useState } from 'react'
import { login, signup, resetPassword } from '@/app/login/actions'
import { Mail, Lock, ArrowRight, UserPlus, LogIn, Eye, EyeOff, Loader2, MailCheck, KeyRound, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type FormMode = 'login' | 'signup' | 'reset'

export default function AuthForm() {
    const [mode, setMode] = useState<FormMode>('login')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [signupSuccess, setSignupSuccess] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMessage(null)
        const formData = new FormData(e.currentTarget)

        // Password confirmation validation for signup
        if (mode === 'signup') {
            const password = formData.get('password') as string
            const confirmPassword = formData.get('confirmPassword') as string

            if (password !== confirmPassword) {
                setErrorMessage('パスワードが一致しません。')
                return
            }
        }

        setIsSubmitting(true)

        let result
        if (mode === 'login') {
            result = await login(formData)
        } else if (mode === 'signup') {
            result = await signup(formData)
        } else {
            result = await resetPassword(formData)
        }

        setIsSubmitting(false)

        if (result && 'error' in result) {
            setErrorMessage(result.error)
        } else if (result && 'success' in result) {
            if (mode === 'signup') {
                setSignupSuccess(true)
            } else if (mode === 'reset') {
                setResetSuccess(true)
            }
        }
    }

    // Success screen for signup
    if (signupSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <MailCheck className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        認証メールを送信しました
                    </h2>
                    <p className="text-gray-600 mb-6">
                        ご登録いただいたメールアドレスに認証リンクを送信しました。
                        メール内のリンクをクリックして、アカウントを有効化してください。
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left">
                        <p className="text-sm text-blue-700">
                            <strong>ヒント:</strong> メールが届かない場合は、迷惑メールフォルダをご確認ください。
                        </p>
                    </div>
                </div>
            </motion.div>
        )
    }

    // Success screen for password reset
    if (resetSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <MailCheck className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        再設定メールを送信しました
                    </h2>
                    <p className="text-gray-600 mb-6">
                        ご登録いただいたメールアドレスにパスワード再設定用のリンクを送信しました。
                        メール内のリンクをクリックして、新しいパスワードを設定してください。
                    </p>
                    <button
                        onClick={() => {
                            setResetSuccess(false)
                            setMode('login')
                        }}
                        className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        ログイン画面に戻る
                    </button>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-8"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-indigo-100 p-3 rounded-full">
                            {mode === 'login' ? (
                                <LogIn className="w-8 h-8 text-indigo-600" />
                            ) : mode === 'signup' ? (
                                <UserPlus className="w-8 h-8 text-indigo-600" />
                            ) : (
                                <KeyRound className="w-8 h-8 text-indigo-600" />
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        {mode === 'login' ? 'おかえりなさい' : mode === 'signup' ? 'アカウント作成' : 'パスワードリセット'}
                    </h2>
                    <p className="text-center text-gray-500 mb-8">
                        {mode === 'login'
                            ? 'アカウントにログインして続行'
                            : mode === 'signup'
                                ? '新しいアカウントを作成して開始'
                                : 'メールアドレスを入力してください'}
                    </p>

                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700"
                        >
                            <p className="font-bold">エラー</p>
                            <p>{errorMessage}</p>
                        </motion.div>
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

                        {mode !== 'reset' && (
                            <>
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
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 bg-white"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {mode === 'login' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMode('reset')
                                                setErrorMessage(null)
                                            }}
                                            className="mt-2 text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
                                        >
                                            パスワードをお忘れですか?
                                        </button>
                                    )}
                                </div>

                                {/* Password confirmation field - only shown for signup */}
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                            パスワード(確認用)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                required
                                                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 bg-white"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Full name field - only shown for signup */}
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                            氏名
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="fullName"
                                                type="text"
                                                required
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 bg-white"
                                                placeholder="例：大塚 孝雄"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Account name field - only shown for signup */}
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                            アカウント名
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                name="accountName"
                                                type="text"
                                                required
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 bg-white"
                                                placeholder="例：大塚ラーメン本店"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    処理中...
                                </>
                            ) : (
                                <>
                                    {mode === 'login' ? 'ログイン' : mode === 'signup' ? '登録する' : 'リセットメール送信'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
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

                        <div className="mt-6 text-center space-y-2">
                            {mode === 'reset' ? (
                                <button
                                    onClick={() => {
                                        setMode('login')
                                        setErrorMessage(null)
                                    }}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    ログインに戻る
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'signup' : 'login')
                                        setErrorMessage(null)
                                    }}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    {mode === 'login'
                                        ? 'アカウントをお持ちでない方はこちら'
                                        : 'すでにアカウントをお持ちの方はこちら'}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                    続行することで、利用規約とプライバシーポリシーに同意したことになります。
                </p>
            </div>
        </div>
    )
}
