'use client'

import { DashboardMetricsView, DashboardMetricsData } from '@/components/DashboardMetrics'

interface DashboardSectionProps {
    metrics: DashboardMetricsData
}

export function DashboardSection({ metrics }: DashboardSectionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">ダッシュボード</h2>
                <p className="text-zinc-500">本日の着信状況と利用時間を確認できます。</p>
            </div>
            <DashboardMetricsView metrics={metrics} />
        </div>
    )
}
