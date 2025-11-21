import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <h1 className="text-center text-4xl font-extrabold text-gray-900 mb-2">
                    AiLuna
                </h1>
                <p className="text-center text-gray-600">
                    AI電話取次サービス
                </p>
            </div>

            <AuthForm />
        </div>
    )
}
