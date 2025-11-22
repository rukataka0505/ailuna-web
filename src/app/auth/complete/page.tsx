import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function AuthCompletePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        メール認証が完了しました
                    </h2>

                    <p className="text-gray-500 mb-8">
                        このままログインしてマイページを開き、<br />
                        サービスの利用を開始できます。
                    </p>

                    <Link
                        href="/dashboard"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.96]"
                    >
                        ログインしてマイページを開く
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
