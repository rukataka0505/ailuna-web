'use client'

import { DashboardMetricsView, DashboardMetricsData } from '@/components/DashboardMetrics'
import { AgentSettings } from '@/types/agent'
import { Settings, Phone, ChevronRight, Clock } from 'lucide-react'
import { DemoCallButton } from '@/components/DemoCallButton'
import { useRouter } from 'next/navigation'

interface DashboardSectionProps {
    metrics: DashboardMetricsData
    onNavigate: (tab: 'agent' | 'history') => void
    agentSettings: AgentSettings
    recentLogs: any[]
    userProfile?: {
        phone_number?: string | null
        account_name?: string | null
    } | null
}

export function DashboardSection({ metrics, onNavigate, agentSettings, recentLogs, userProfile }: DashboardSectionProps) {
    const router = useRouter()
    const latestLog = recentLogs.length > 0 ? recentLogs[0] : null

    // Demo user detection: no phone number assigned
    const isDemoUser = !userProfile?.phone_number

    // 日付フォーマット用ヘルパー
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="space-y-8">
            {/* Demo call button for users without phone number */}
            {isDemoUser && (
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-zinc-900">AIコンシェルジュを体験</h2>
                            <p className="text-sm text-zinc-600 mt-1">
                                電話番号なしでも、ブラウザから直接AIと会話できます
                            </p>
                        </div>
                        <DemoCallButton onClick={() => router.push('/dashboard/demo-call')} />
                    </div>
                </div>
            )}

            <DashboardMetricsView metrics={metrics} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AIエージェント設定カード */}
                <button
                    onClick={() => onNavigate('agent')}
                    className="flex flex-col h-full p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50/30 transition-all text-left group relative overflow-hidden"
                >
                    <div className="flex items-center justify-between w-full mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Settings className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-zinc-900">AIエージェント設定</h3>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-indigo-400 transition-colors" />
                    </div>

                    <div className="w-full space-y-3">
                        <div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">現在の挨拶</div>
                            <div className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 font-medium line-clamp-2 group-hover:bg-white transition-colors">
                                {agentSettings.config_metadata?.greeting_message || '（未設定）'}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200">
                                {agentSettings.config_metadata?.tone === 'polite' ? '丁寧' :
                                    agentSettings.config_metadata?.tone === 'friendly' ? 'フレンドリー' :
                                        agentSettings.config_metadata?.tone === 'casual' ? 'カジュアル' : '標準'}
                            </span>
                            <span>文字数: {agentSettings.system_prompt?.length || 0}文字</span>
                        </div>
                    </div>
                </button>

                {/* 通話履歴カード */}
                <button
                    onClick={() => onNavigate('history')}
                    className="flex flex-col h-full p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50/30 transition-all text-left group relative overflow-hidden"
                >
                    <div className="flex items-center justify-between w-full mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Phone className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-zinc-900">通話履歴</h3>
                        </div>
                        <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
                    </div>

                    {latestLog ? (
                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{formatDate(latestLog.created_at)}</span>
                                </div>
                                <span className="font-mono text-zinc-400">{latestLog.caller_number}</span>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">最新の通話メモ</div>
                                <div className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-lg border border-zinc-100 font-medium line-clamp-2 group-hover:bg-white transition-colors">
                                    {latestLog.summary || '要約なし'}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-2 py-2">
                            <Phone className="h-8 w-8 opacity-20" />
                            <span className="text-sm">履歴はまだありません</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    )
}
