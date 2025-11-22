import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { Phone, MessageSquare, Settings, BarChart3, ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mt-10 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
          <div className="text-center">
            <h1>
              <span className="block text-sm font-semibold text-indigo-600 tracking-wide uppercase">
                AI電話取次サービス
              </span>
              <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                <span className="block text-gray-900">電話対応をAIに任せて</span>
                <span className="block text-indigo-600">あとからチャットで振り返る</span>
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              AiLuna（アイルナ）は、AIがあなたの代わりに電話対応。
              通話内容はチャット形式で確認でき、AIへの指示も自由に編集できます。
              お店に合わせたAIオペレーターを、今すぐ無料で試せます。
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/login?mode=signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all active:scale-[0.96]"
                >
                  無料で試してみる
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 sm:mt-24 lg:mt-32">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900">トーク形式で通話を確認</h3>
                <p className="mt-2 text-base text-gray-500">
                  電話の内容を、LINEのようなチャット形式で振り返れます。いつ・誰が・何を話したか一目瞭然。
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <Settings className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900">AIの話し方を自分で編集</h3>
                <p className="mt-2 text-base text-gray-500">
                  挨拶や対応方法をダッシュボードから簡単にカスタマイズ。お店ごとのAIオペレーターが作れます。
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-medium text-gray-900">着信状況をひと目で把握</h3>
                <p className="mt-2 text-base text-gray-500">
                  着信件数・利用時間・今月の請求額など、必要な情報がダッシュボードに集約されています。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 sm:mt-24 lg:mt-32 mb-20">
          <div className="bg-indigo-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">今すぐ始めませんか？</span>
                  <span className="block text-indigo-200">無料でお試しいただけます。</span>
                </h2>
              </div>
              <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-all active:scale-[0.96]"
                >
                  アカウント登録
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
