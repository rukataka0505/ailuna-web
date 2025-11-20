import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'
import {
    Phone,
    Settings,
    CreditCard,
    LogOut,
    LayoutDashboard,
    User,
    BarChart3,
    Save
} from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* サイドバー */}
            <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-zinc-200">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Phone className="h-6 w-6" />
                        <span className="text-xl font-bold text-zinc-900">AiLuna</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
                        <LayoutDashboard className="h-5 w-5" />
                        ダッシュボード
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors">
                        <Settings className="h-5 w-5" />
                        AI設定
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg transition-colors">
                        <CreditCard className="h-5 w-5" />
                        請求管理
                    </a>
                </nav>

                <div className="p-4 border-t border-zinc-200">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 truncate">
                                {user.email}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                                Free Plan
                            </p>
                        </div>
                    </div>
                    <form action={signOut}>
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 hover:text-red-600 transition-colors">
                            <LogOut className="h-4 w-4" />
                            ログアウト
                        </button>
                    </form>
                </div>
            </aside>

            {/* メインコンテンツ */}
            <main className="flex-1 overflow-y-auto">
                {/* モバイルヘッダー（スマホ用） */}
                <div className="md:hidden bg-white border-b border-zinc-200 p-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Phone className="h-6 w-6" />
                        <span className="text-xl font-bold text-zinc-900">AiLuna</span>
                    </div>
                    <form action={signOut}>
                        <button className="p-2 text-zinc-500">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
                    {/* ステータスカード */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-zinc-500">今月の着信対応</h3>
                                <Phone className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="text-2xl font-bold text-zinc-900">0件</div>
                            <p className="text-xs text-zinc-500 mt-1">先月比 +0%</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-zinc-500">利用時間</h3>
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="text-2xl font-bold text-zinc-900">0分</div>
                            <p className="text-xs text-zinc-500 mt-1">残り無料枠: 60分</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-zinc-500">現在のプラン</h3>
                                <CreditCard className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="text-2xl font-bold text-zinc-900">Free</div>
                            <button className="text-xs text-indigo-600 font-medium mt-1 hover:underline">
                                プロプランへアップグレード
                            </button>
                        </div>
                    </section>

                    {/* AI設定フォーム（ダミー） */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-zinc-900">AIエージェント設定</h2>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">未保存の変更があります</span>
                        </div>

                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 mb-2">
                                        電話に出た時の挨拶
                                    </label>
                                    <p className="text-xs text-zinc-500 mb-2">
                                        AIが電話に出た際、最初に発話するメッセージです。会社名を含めることを推奨します。
                                    </p>
                                    <textarea

                                        className="w-full min-h-[80px] p-3 text-sm text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y"
                                        placeholder="お電話ありがとうございます。株式会社AiLunaでございます。担当にお繋ぎいたしますので、ご用件をお話しください。"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 mb-2">
                                        事業内容の説明 (AIへの指示)
                                    </label>
                                    <p className="text-xs text-zinc-500 mb-2">
                                        あなたの会社のサービス内容や、よくある質問への回答方針を入力してください。
                                    </p>
                                    <textarea
                                        className="w-full min-h-[80px] p-3 text-sm text-zinc-900 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y"
                                        placeholder="当社はAI電話代行サービスを提供しています。料金は月額980円からです。営業時間は平日9:00〜18:00です..."
                                    />
                                </div>
                            </div>
                            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end">
                                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                    <Save className="h-4 w-4" />
                                    設定を保存する
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}