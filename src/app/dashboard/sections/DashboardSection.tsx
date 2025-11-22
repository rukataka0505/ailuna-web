'use client'

import { DashboardMetricsView, DashboardMetricsData } from '@/components/DashboardMetrics'

interface DashboardSectionProps {
    metrics: DashboardMetricsData
}

export function DashboardSection({ metrics }: DashboardSectionProps) {
    return (
        <div className="space-y-6">
            <DashboardMetricsView metrics={metrics} />
        </div>
    )
}
