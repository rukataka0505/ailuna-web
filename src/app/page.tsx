import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/AuthForm'
import { Phone, Shield, Zap } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AiLuna</span>
          </div>
        </header>

        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1>
                <span className="block text-sm font-semibold text-indigo-600 tracking-wide uppercase">
                  AI電話取次サービス
                </span>
                <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                  <span className="block text-gray-900">電話対応は</span>
                  <span className="block text-indigo-600">AIにお任せください</span>
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                AiLuna（アイルナ）は、あなたの代わりに電話に応答し、要件を聞き取り、即座に通知する次世代のAI電話番です。
                もう重要な電話を逃したり、営業電話に時間を取られることはありません。
              </p>

              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                        <Zap className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">即時応答・通知</h3>
                      <p className="text-gray-500">24時間365日、待ち時間なしで対応します。</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                        <Shield className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">迷惑電話ブロック</h3>
                      <p className="text-gray-500">営業電話や迷惑電話を自動でフィルタリング。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <AuthForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
