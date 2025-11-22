import { Phone, BarChart3, CreditCard } from 'lucide-react'
import { fetchCallMetrics } from '@/app/dashboard/actions'

export interface DashboardMetricsData {
    totalCalls: number
    totalDurationMinutes: number
    currentMonthBilling: number
}

export function DashboardMetricsView({ metrics }: { metrics: DashboardMetricsData }) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-zinc-500">今月の着信対応</h3>
                    <Phone className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-zinc-900">{metrics.totalCalls}件</div>
                <p className="text-xs text-zinc-500 mt-1">全期間の合計</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-zinc-500">利用時間</h3>
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-zinc-900">{metrics.totalDurationMinutes.toFixed(1)}分</div>
                <p className="text-xs text-zinc-500 mt-1">残り無料枠: 60分</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-zinc-500">今月の請求額</h3>
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-zinc-900">¥{metrics.currentMonthBilling.toLocaleString()}</div>
                <p className="text-xs text-zinc-500 mt-1">※ 請求計算ロジックは今後実装予定です。</p>
            </div>
        </section>
    )
}

export async function DashboardMetrics() {
    const metrics = await fetchCallMetrics()
    // TODO: 今月の通話時間と料金設定から実際の請求額を計算する
    const metricsWithBilling = {
        ...metrics,
        currentMonthBilling: 0
    }
    return <DashboardMetricsView metrics={metricsWithBilling} />
}

export function DashboardMetricsSkeleton() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 w-24 bg-zinc-100 rounded"></div>
                        <div className="h-5 w-5 bg-zinc-100 rounded"></div>
                    </div>
                    <div className="h-8 w-16 bg-zinc-100 rounded mb-2"></div>
                    <div className="h-3 w-32 bg-zinc-100 rounded"></div>
                </div>
            ))}
        </section>
    )
}
