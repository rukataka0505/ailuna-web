'use client'

import { useState } from 'react'
import { ChevronDown, Phone } from 'lucide-react'
import { ConversationViewer, TranscriptItem } from './ConversationViewer'

type CallLog = {
    id: string
    created_at: string
    caller_number: string | null
    call_sid: string | null
    transcript: TranscriptItem[] | null
    summary: string | null
}

interface CallLogAccordionProps {
    callLogs: CallLog[]
}

export function CallLogAccordion({ callLogs }: CallLogAccordionProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    if (!callLogs || callLogs.length === 0) {
        return (
            <div className="p-10 text-center text-zinc-500">
                通話履歴はまだありません
            </div>
        )
    }

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).replace(/\//g, '/')
    }

    return (
        <div className="divide-y divide-zinc-100">
            {callLogs.map((log) => {
                const isExpanded = expandedId === log.id

                return (
                    <div key={log.id} className="transition-colors">
                        {/* 閉じた状態のリストアイテム */}
                        <button
                            onClick={() => toggleExpand(log.id)}
                            className="w-full hover:bg-zinc-50 transition-colors cursor-pointer focus:outline-none focus:bg-zinc-50 active:scale-[0.99]"
                        >
                            <div className="flex items-center justify-between p-5">
                                <div className="flex-1 text-left">
                                    {/* 日時と電話番号 */}
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                                            <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                            <span>{formatDate(log.created_at)}</span>
                                        </div>
                                        <span className="text-sm text-zinc-600">
                                            {log.caller_number || '不明'}
                                        </span>
                                    </div>

                                    {/* 要約 */}
                                    <p className="text-sm text-zinc-500 line-clamp-2">
                                        {log.summary || '要約なし'}
                                    </p>
                                </div>

                                {/* 展開アイコン */}
                                <ChevronDown
                                    className={`h-5 w-5 text-zinc-400 transition-transform flex-shrink-0 ml-3 ${isExpanded ? 'rotate-180' : ''
                                        }`}
                                />
                            </div>
                        </button>

                        {/* 展開時の詳細ビュー */}
                        {isExpanded && (
                            <div className="px-5 pb-5 pt-2 bg-zinc-50/50 border-t border-zinc-100">
                                {log.call_sid && (
                                    <div className="mb-3 text-xs text-zinc-500">
                                        <span className="font-medium">Call ID:</span> {log.call_sid}
                                    </div>
                                )}
                                <ConversationViewer transcript={log.transcript || []} />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
