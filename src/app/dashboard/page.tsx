import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut, fetchCallLogsPaginated, fetchUniqueCallerNumbers } from './actions'
import { DashboardForm } from './DashboardForm'
import {
    Phone,
    Settings,
    CreditCard,
    LogOut,
    LayoutDashboard,
    User,
} from 'lucide-react'
import { CallLogList } from '@/components/CallLogList'
import { Suspense } from 'react'
import { DashboardMetrics, DashboardMetricsSkeleton } from '@/components/DashboardMetrics'


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

    const { logs: initialLogs, count: initialCount } = await fetchCallLogsPaginated(0, 10)
    const uniqueCallers = await fetchUniqueCallerNumbers()


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
                        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 hover:text-red-600 transition-all active:scale-95">
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
                        <button className="p-2 text-zinc-500 transition-all active:scale-95">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
                    {/* ステータスカード */}
                    <Suspense fallback={<DashboardMetricsSkeleton />}>
                        <DashboardMetrics />
                    </Suspense>

                    {/* AI設定フォーム */}
                    <DashboardForm
                        initialGreeting={prompts?.greeting_message || ''}
                        initialDescription={prompts?.business_description || ''}
                    />

                    {/* 通話履歴 */}
                    <section className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        {/* ヘッダーは CallLogList 内に移動したため削除 */}
                        <CallLogList 
                            initialLogs={initialLogs || []} 
                            initialCount={initialCount} 
                            uniqueCallers={uniqueCallers}
                        />
                    </section>

                </div>
            </main>
        </div>
    )
}
