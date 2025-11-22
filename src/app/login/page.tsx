import AuthForm from '@/components/AuthForm'
import Header from '@/components/Header'

type FormMode = 'login' | 'signup' | 'reset'

interface LoginPageProps {
    searchParams: Promise<{ mode?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams
    const mode = params.mode as FormMode | undefined
    const initialMode: FormMode = mode === 'signup' || mode === 'login' || mode === 'reset' ? mode : 'login'

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Header />

            <div className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                    <h1 className="text-center text-4xl font-extrabold text-gray-900 mb-2">
                        AiLuna
                    </h1>
                    <p className="text-center text-gray-600">
                        AI電話取次サービス
                    </p>
                </div>

                <AuthForm initialMode={initialMode} />
            </div>
        </div>
    )
}
