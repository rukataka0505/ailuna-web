'use client'

import { CallLogList } from '@/components/CallLogList'

interface CallHistorySectionProps {
    initialLogs: any[]
    initialCount: number
    uniqueCallers: string[]
}

export function CallHistorySection({ initialLogs, initialCount, uniqueCallers }: CallHistorySectionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">通話履歴</h2>
                <p className="text-zinc-500">過去の着信履歴と通話内容を確認できます。</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                <CallLogList
                    initialLogs={initialLogs}
                    initialCount={initialCount}
                    uniqueCallers={uniqueCallers}
                />
            </div>
        </div>
    )
}
