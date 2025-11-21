'use client'

import { useState } from 'react'
import { ChevronDown, Phone, Loader2, ArrowUpDown } from 'lucide-react'
import { ConversationViewer, TranscriptItem } from './ConversationViewer'
import { fetchCallLogsPaginated } from '@/app/dashboard/actions'

type CallLog = {
    id: string
    created_at: string
    caller_number: string | null
    call_sid: string | null
    transcript: TranscriptItem[] | null
    summary: string | null
}

interface CallLogListProps {
    initialLogs: CallLog[]
    initialCount: number | null
}

export function CallLogList({ initialLogs, initialCount }: CallLogListProps) {
    const [logs, setLogs] = useState<CallLog[]>(initialLogs)
    const [count, setCount] = useState<number>(initialCount || 0)
    const [offset, setOffset] = useState(10)
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
    const [loading, setLoading] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)

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

    const handleSortChange = async () => {
        const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc'
        setSortOrder(newSortOrder)
        setLoading(true)
        try {
            // Reset to first page
            const { logs: newLogs, count: newCount } = await fetchCallLogsPaginated(0, 10, newSortOrder)
            setLogs(newLogs as CallLog[])
            setCount(newCount || 0)
            setOffset(10)
            setExpandedId(null)
        } catch (error) {
            console.error('Failed to sort logs:', error)
            alert('並び替えに失敗しました。')
        } finally {
            setLoading(false)
        }
    }

    const handleLoadMore = async () => {
        setLoading(true)
        try {
            const { logs: newLogs } = await fetchCallLogsPaginated(offset, 10, sortOrder)
            if (newLogs && newLogs.length > 0) {
                setLogs([...logs, ...newLogs as CallLog[]])
                setOffset(offset + 10)
            }
        } catch (error) {
            console.error('Failed to load more logs:', error)
            alert('読み込みに失敗しました。')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {/* ヘッダー部分：件数表示とソートボタン */}
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-zinc-900">通話履歴</h2>
                    <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                        全{count}件
                    </span>
                </div>
                <button
                    onClick={handleSortChange}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-3 py-2 rounded-lg transition-all active:scale-[0.96]"
                >
                    <ArrowUpDown className="h-4 w-4" />
                    {sortOrder === 'desc' ? '新しい順' : '古い順'}
                </button>
            </div>

            {/* リスト表示 */}
            <div className="divide-y divide-zinc-100 bg-white">
                {logs.length === 0 ? (
                    <div className="p-10 text-center text-zinc-500">
                        通話履歴はまだありません
                    </div>
                ) : (
                    logs.map((log) => {
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
                                            <p className={`text-sm text-zinc-500 ${isExpanded ? '' : 'line-clamp-1'}`}>
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
                    })
                )}
            </div>

            {/* さらに読み込むボタン */}
            {logs.length < count && (
                <div className="p-4 border-t border-zinc-200 bg-zinc-50">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-all active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                読み込み中...
                            </>
                        ) : (
                            'さらに読み込む'
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
