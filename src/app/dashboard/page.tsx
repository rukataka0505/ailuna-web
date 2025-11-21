import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'
import { DashboardForm } from './DashboardForm'
import {
    Phone,
    Settings,
    CreditCard,
    LogOut,
    LayoutDashboard,
    User,
    BarChart3,
    History,
} from 'lucide-react'
import { ConversationViewer, TranscriptItem } from '@/components/ConversationViewer'


export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: prompts } = await supabase
        .from('user_prompts')
        .select('*')
        .eq('user_id', user.id)
        .single()

    const { data: callLogs } = await supabase
        .from('call_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)


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

                    {/* AI設定フォーム */}
                    <DashboardForm
                        initialGreeting={prompts?.greeting_message || ''}
                        initialDescription={prompts?.business_description || ''}
                    />

                    {/* 通話履歴 */}
                    <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-200 flex items-center gap-2">
                            <History className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-zinc-900">通話履歴</h2>
                        </div>
                        <div className="divide-y divide-zinc-100">
                            {callLogs?.map((log: any) => (
                                <div key={log.id} className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-medium text-zinc-900">
                                                {new Date(log.created_at).toLocaleString('ja-JP')}
                                            </div>
                                            <span className="px-2 py-1 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full">
                                                {log.call_sid || 'Unknown ID'}
                                            </span>
                                        </div>
                                    </div>
                                    <ConversationViewer transcript={log.transcript as TranscriptItem[]} />
                                </div>
                            ))}
                            {(!callLogs || callLogs.length === 0) && (
                                <div className="p-10 text-center text-zinc-500">
                                    通話履歴はまだありません
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    )
}