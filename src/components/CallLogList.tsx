'use client'

import { useState } from 'react'
import { ChevronDown, Phone, Loader2, Search, X, Calendar, User, Filter } from 'lucide-react'
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
    uniqueCallers: string[]
}

export function CallLogList({ initialLogs, initialCount, uniqueCallers }: CallLogListProps) {
    const [logs, setLogs] = useState<CallLog[]>(initialLogs)
    const [count, setCount] = useState<number>(initialCount || 0)
    const [offset, setOffset] = useState(10)
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        callerNumber: ''
    })
    const [activeFilters, setActiveFilters] = useState({
        startDate: '',
        endDate: '',
        callerNumber: ''
    })
    const [loading, setLoading] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [isFilterOpen, setIsFilterOpen] = useState(false)

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

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const applyFilters = async () => {
        setLoading(true)
        setActiveFilters(filters)
        try {
            // Reset to first page
            const { logs: newLogs, count: newCount } = await fetchCallLogsPaginated(0, 10, filters)
            setLogs(newLogs as CallLog[])
            setCount(newCount || 0)
            setOffset(10)
            setExpandedId(null)
            setIsFilterOpen(false)
        } catch (error) {
            console.error('Failed to apply filters:', error)
            alert('検索に失敗しました。')
        } finally {
            setLoading(false)
        }
    }

    const clearFilters = async () => {
        const emptyFilters = { startDate: '', endDate: '', callerNumber: '' }
        setFilters(emptyFilters)
        setActiveFilters(emptyFilters)
        setLoading(true)
        try {
            // Reset to first page
            const { logs: newLogs, count: newCount } = await fetchCallLogsPaginated(0, 10, emptyFilters)
            setLogs(newLogs as CallLog[])
            setCount(newCount || 0)
            setOffset(10)
            setExpandedId(null)
        } catch (error) {
            console.error('Failed to clear filters:', error)
            alert('リセットに失敗しました。')
        } finally {
            setLoading(false)
        }
    }

    const handleLoadMore = async () => {
        setLoading(true)
        try {
            const { logs: newLogs } = await fetchCallLogsPaginated(offset, 10, activeFilters)
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
            {/* ヘッダー部分：件数表示とフィルター */}
            <div className="relative p-6 border-b border-zinc-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-zinc-900">通話履歴</h2>
                        <span className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
                            全{count}件
                        </span>
                    </div>

                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-2 rounded-lg transition-colors border border-transparent ${isFilterOpen
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-200'
                            }`}
                        title="フィルター"
                    >
                        <Filter className="h-5 w-5" />
                    </button>
                </div>

                {/* フィルターポップアップ */}
                {isFilterOpen && (
                    <>
                        {/* 背景クリックで閉じるためのオーバーレイ */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />

                        <div className="absolute right-6 top-full mt-2 w-full md:w-[320px] bg-white p-5 rounded-xl shadow-xl border border-zinc-200 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-zinc-900">絞り込み検索</h3>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* 期間フィルター */}
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                                            <Calendar className="h-3.5 w-3.5" />
                                            開始日
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={filters.startDate}
                                            onChange={handleFilterChange}
                                            className="block w-full text-sm border-zinc-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-zinc-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                                            <Calendar className="h-3.5 w-3.5" />
                                            終了日
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={filters.endDate}
                                            onChange={handleFilterChange}
                                            className="block w-full text-sm border-zinc-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-zinc-900"
                                        />
                                    </div>
                                </div>

                                {/* 発信者フィルター */}
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                                        <User className="h-3.5 w-3.5" />
                                        発信者
                                    </label>
                                    <select
                                        name="callerNumber"
                                        value={filters.callerNumber}
                                        onChange={handleFilterChange}
                                        className="block w-full text-sm border-zinc-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-zinc-900"
                                    >
                                        <option value="">全ての発信者</option>
                                        {uniqueCallers.map((number) => (
                                            <option key={number} value={number}>
                                                {number}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* アクションボタン */}
                                <div className="pt-2 flex gap-2">
                                    <button
                                        onClick={clearFilters}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-all active:scale-[0.96]"
                                    >
                                        クリア
                                    </button>
                                    <button
                                        onClick={applyFilters}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all active:scale-[0.96] disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        検索
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* リスト表示 */}
            <div className="divide-y divide-zinc-100 bg-white">
                {logs.length === 0 ? (
                    <div className="p-10 text-center text-zinc-500">
                        条件に一致する通話履歴はありません
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
