'use client'

import { useState, useEffect } from 'react'
import { Calendar, Filter, ChevronLeft, ChevronRight, Loader2, X, Check, ArrowLeft, Settings, Mail, Plus, Trash2, List, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import {
    fetchReservationRequestsPaginated,
    ReservationStatus,
    approveReservationRequest,
    rejectReservationRequest,
    getStoreNotificationSettings,
    upsertStoreNotificationSettings,
    StoreNotificationSettings,
    listReservationFields,
    createReservationField,
    updateReservationField,
    deleteReservationField,
    reorderReservationFields,
    initializeDefaultFields,
    ReservationField,
    ReservationFieldType
} from '../actions'

interface ReservationSectionProps {
    // Props can be expanded later if needed
}

type SubTab = 'requests' | 'settings' | 'form'

export function ReservationSection({ }: ReservationSectionProps) {
    const [activeTab, setActiveTab] = useState<SubTab>('requests')

    // --- Request List State ---
    const [requests, setRequests] = useState<any[]>([])
    const [count, setCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all')
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)

    // For rejection dialog
    const [rejectReason, setRejectReason] = useState('')
    const [internalNote, setInternalNote] = useState('')
    const [showRejectForm, setShowRejectForm] = useState(false)

    // --- Notification Settings State ---
    const [notificationSettings, setNotificationSettings] = useState<StoreNotificationSettings>({
        notify_email_enabled: false,
        notify_emails: [],
        notify_line_enabled: false
    })
    const [isSettingsLoading, setIsSettingsLoading] = useState(false)
    const [isSavingSettings, setIsSavingSettings] = useState(false)
    const [newEmail, setNewEmail] = useState('')

    // --- Form Fields State ---
    const [formFields, setFormFields] = useState<ReservationField[]>([])
    const [isFieldsLoading, setIsFieldsLoading] = useState(false)
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null)

    // Edit/Create buffer
    const [editBuffer, setEditBuffer] = useState<Partial<ReservationField>>({})
    const [showCreateForm, setShowCreateForm] = useState(false)

    const itemsPerPage = 10
    const totalPages = Math.ceil(count / itemsPerPage)

    // Load Requests
    const loadData = async () => {
        setIsLoading(true)
        try {
            const offset = (page - 1) * itemsPerPage
            const { requests: data, count: total } = await fetchReservationRequestsPaginated(
                offset,
                itemsPerPage,
                { status: statusFilter }
            )
            setRequests(data || [])
            setCount(total || 0)
        } catch (error) {
            console.error('Failed to load reservations:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Load Settings
    const loadSettings = async () => {
        setIsSettingsLoading(true)
        try {
            const data = await getStoreNotificationSettings()
            if (data) {
                setNotificationSettings(data)
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setIsSettingsLoading(false)
        }
    }

    // Load Form Fields
    const loadFormFields = async () => {
        setIsFieldsLoading(true)
        try {
            const data = await listReservationFields()
            setFormFields(data)
        } catch (error) {
            console.error('Failed to load form fields:', error)
        } finally {
            setIsFieldsLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'requests') loadData()
        else if (activeTab === 'settings') loadSettings()
        else if (activeTab === 'form') loadFormFields()
    }, [page, statusFilter, activeTab])

    const formatDate = (dateString: string) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            auto_approved: 'bg-blue-100 text-blue-800 border-blue-200',
        }[status] || 'bg-gray-100 text-gray-800 border-gray-200'

        const labels = {
            pending: '確認待ち',
            approved: '承認済み',
            rejected: '却下',
            auto_approved: '自動承認',
        }[status] || status

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
                {labels}
            </span>
        )
    }

    const handleApprove = async () => {
        if (!confirm('この予約を承認しますか？')) return
        setIsActionLoading(true)
        try {
            const res = await approveReservationRequest(selectedRequest.id, internalNote)
            if (res?.error) {
                alert(res.error)
            } else {
                setSelectedRequest(null)
                loadData()
            }
        } catch (err) {
            console.error(err)
            alert('エラーが発生しました')
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('却下理由を入力してください')
            return
        }
        if (!confirm('この予約を却下しますか？')) return

        setIsActionLoading(true)
        try {
            const res = await rejectReservationRequest(selectedRequest.id, rejectReason, internalNote)
            if (res?.error) {
                alert(res.error)
            } else {
                setShowRejectForm(false)
                setRejectReason('')
                setSelectedRequest(null)
                loadData()
            }
        } catch (err) {
            console.error(err)
            alert('エラーが発生しました')
        } finally {
            setIsActionLoading(false)
        }
    }

    // --- Settings Handlers ---
    const handleAddEmail = () => {
        if (!newEmail || !newEmail.includes('@')) return
        if (notificationSettings.notify_emails.includes(newEmail)) return

        setNotificationSettings(prev => ({
            ...prev,
            notify_emails: [...prev.notify_emails, newEmail]
        }))
        setNewEmail('')
    }

    const handleRemoveEmail = (emailToRemove: string) => {
        setNotificationSettings(prev => ({
            ...prev,
            notify_emails: prev.notify_emails.filter(e => e !== emailToRemove)
        }))
    }

    const handleSaveSettings = async () => {
        setIsSavingSettings(true)
        try {
            const res = await upsertStoreNotificationSettings(notificationSettings)
            if (res?.error) {
                alert(res.error)
            } else {
                alert(res.success)
            }
        } catch (err) {
            console.error(err)
            alert('保存に失敗しました')
        } finally {
            setIsSavingSettings(false)
        }
    }

    // --- Form Field Handlers ---
    const handleInitDefaults = async () => {
        if (!confirm('現在の設定がある場合でもデフォルト項目を追加しますか？')) return
        setIsFieldsLoading(true)
        try {
            const res = await initializeDefaultFields()
            if (res.error) alert(res.error)
            else {
                await loadFormFields()
                alert(res.success)
            }
        } finally {
            setIsFieldsLoading(false)
        }
    }

    const handleCreateField = async () => {
        if (!editBuffer.field_key || !editBuffer.label) {
            alert('キーとラベルは必須です')
            return
        }

        setIsFieldsLoading(true)
        try {
            const res = await createReservationField({
                field_key: editBuffer.field_key!,
                label: editBuffer.label!,
                field_type: (editBuffer.field_type as ReservationFieldType) || 'text',
                required: editBuffer.required || false,
                enabled: editBuffer.enabled !== false, // default true
                options: editBuffer.options || [],
                display_order: formFields.length + 1
            })
            if (res?.error) alert(res.error)
            else {
                setShowCreateForm(false)
                setEditBuffer({})
                loadFormFields()
            }
        } finally {
            setIsFieldsLoading(false)
        }
    }

    const handleStartEdit = (field: ReservationField) => {
        setEditingFieldId(field.id)
        setEditBuffer({ ...field })
    }

    const handleCancelEdit = () => {
        setEditingFieldId(null)
        setEditBuffer({})
    }

    const handleSaveEdit = async () => {
        if (!editingFieldId) return

        setIsFieldsLoading(true)
        try {
            const res = await updateReservationField(editingFieldId, editBuffer)
            if (res?.error) alert(res.error)
            else {
                setEditingFieldId(null)
                setEditBuffer({})
                loadFormFields()
            }
        } finally {
            setIsFieldsLoading(false)
        }
    }

    const handleDeleteField = async (id: string) => {
        if (!confirm('この項目を削除しますか？')) return

        setIsFieldsLoading(true)
        try {
            const res = await deleteReservationField(id)
            if (res?.error) alert(res.error)
            else loadFormFields()
        } finally {
            setIsFieldsLoading(false)
        }
    }

    const handleMoveField = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === formFields.length - 1) return

        const newFields = [...formFields]
        // swap
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        const temp = newFields[index]
        newFields[index] = newFields[targetIndex]
        newFields[targetIndex] = temp

        setFormFields(newFields) // optimistic update

        // save order
        const ids = newFields.map(f => f.id)
        await reorderReservationFields(ids)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900">予約管理</h2>
                    <p className="text-zinc-500">
                        {activeTab === 'requests' && 'AIが受け付けた予約リクエストの確認'}
                        {activeTab === 'settings' && 'AIからの通知設定'}
                        {activeTab === 'form' && '予約時にお客様に聞く質問項目の設定'}
                    </p>
                </div>

                {/* Active Tab Switcher */}
                <div className="flex bg-zinc-100 p-1 rounded-xl shrink-0">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'requests'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                    >
                        リクエスト
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === 'settings'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                    >
                        <Settings className="h-4 w-4" />
                        通知設定
                    </button>
                    <button
                        onClick={() => setActiveTab('form')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === 'form'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                    >
                        <List className="h-4 w-4" />
                        フォーム設定
                    </button>
                </div>
            </div>

            {activeTab === 'requests' && (
                // --- Request List & Details View (Existing Code) ---
                <>
                    {selectedRequest ? (
                        // ... Details View ...
                        <div className="space-y-6">
                            <div>
                                <button
                                    onClick={() => {
                                        setSelectedRequest(null)
                                        setShowRejectForm(false)
                                        setRejectReason('')
                                        setInternalNote('')
                                    }}
                                    className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    一覧に戻る
                                </button>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-zinc-900">予約詳細</h2>
                                    {getStatusBadge(selectedRequest.status)}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden p-6 md:p-8 space-y-8">
                                {/* Basic Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">顧客情報</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-zinc-400">お名前</label>
                                                <div className="text-lg font-medium text-zinc-900">
                                                    {selectedRequest.customer_name || '未入力'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-400">電話番号</label>
                                                <div className="text-base font-mono text-zinc-700">
                                                    {selectedRequest.caller_number || '不明'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">予約希望内容</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-zinc-400">希望日時</label>
                                                <div className="text-lg font-medium text-zinc-900">
                                                    {selectedRequest.requested_date ? formatDate(selectedRequest.requested_date) : '未指定'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-400">人数</label>
                                                <div className="text-base text-zinc-700">
                                                    {selectedRequest.party_size ? `${selectedRequest.party_size}名` : '未指定'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-400">詳細・メモ</label>
                                                <div className="text-base text-zinc-700 whitespace-pre-wrap">
                                                    {selectedRequest.content || selectedRequest.memo || '（なし）'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Area for Pending Requests */}
                                {selectedRequest.status === 'pending' && (
                                    <div className="border-t border-zinc-100 pt-8 mt-8">
                                        <h3 className="text-sm font-bold text-zinc-900 mb-4">承認アクション</h3>

                                        <div className="mb-4">
                                            <label className="block text-sm text-zinc-600 mb-1">社内用メモ (任意)</label>
                                            <textarea
                                                className="w-full text-sm border-zinc-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                rows={2}
                                                placeholder="承認/却下時に記録を残せます"
                                                value={internalNote}
                                                onChange={(e) => setInternalNote(e.target.value)}
                                            />
                                        </div>

                                        {!showRejectForm ? (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={handleApprove}
                                                    disabled={isActionLoading}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                                    承認する
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectForm(true)}
                                                    disabled={isActionLoading}
                                                    className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <X className="h-5 w-5" />
                                                    却下する
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-red-50 p-6 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                                                <h4 className="font-bold text-red-800 mb-2">却下の理由を入力</h4>
                                                <p className="text-xs text-red-600 mb-4">
                                                    ※ 現在、SMS送信機能は無効化されています。DBの状態のみ更新されます。
                                                </p>
                                                <textarea
                                                    className="w-full mb-4 border-red-200 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm"
                                                    rows={3}
                                                    placeholder="例：あいにく満席のため"
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => setShowRejectForm(false)}
                                                        className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
                                                    >
                                                        キャンセル
                                                    </button>
                                                    <button
                                                        onClick={handleReject}
                                                        disabled={isActionLoading || !rejectReason.trim()}
                                                        className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 disabled:opacity-50 transition-all"
                                                    >
                                                        {isActionLoading ? '処理中...' : '却下を確定'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // ... List View ...
                        <div className="space-y-6">
                            <div className="flex items-center justify-end">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-zinc-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value as ReservationStatus | 'all')
                                            setPage(1) // Reset to first page
                                        }}
                                        className="text-sm border-zinc-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="all">すべてのステータス</option>
                                        <option value="pending">確認待ち</option>
                                        <option value="approved">承認済み</option>
                                        <option value="auto_approved">自動承認</option>
                                        <option value="rejected">却下</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                                    </div>
                                ) : requests.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                                        <Calendar className="h-10 w-10 mb-2 opacity-20" />
                                        <p>予約リクエストはありません</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b border-zinc-100">
                                                <tr>
                                                    <th className="px-6 py-3 font-medium">受信日時</th>
                                                    <th className="px-6 py-3 font-medium">ステータス</th>
                                                    <th className="px-6 py-3 font-medium">顧客名 / 電話番号</th>
                                                    <th className="px-6 py-3 font-medium">希望日時 / 内容</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100">
                                                {requests.map((req) => (
                                                    <tr
                                                        key={req.id}
                                                        onClick={() => setSelectedRequest(req)}
                                                        className={`hover:bg-zinc-50/80 cursor-pointer transition-colors ${req.status === 'pending' ? 'bg-yellow-50/30' : ''}`}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                                                            {formatDate(req.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {getStatusBadge(req.status)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-zinc-900">
                                                                {req.customer_name || req.caller_number || '不明'}
                                                            </div>
                                                            {(req.customer_name && req.caller_number) && (
                                                                <div className="text-xs text-zinc-400">{req.caller_number}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-zinc-600">
                                                            <div>{req.requested_date ? formatDate(req.requested_date) : '-'}</div>
                                                            <div className="text-xs text-zinc-400 truncate max-w-[200px]">
                                                                {req.content || req.memo || ''}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100">
                                        <div className="text-sm text-zinc-500">
                                            {count} 件中 {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, count)} 件を表示
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="p-1 rounded hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <span className="text-sm font-medium text-zinc-700">
                                                {page} / {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                disabled={page === totalPages}
                                                className="p-1 rounded hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {activeTab === 'settings' && (
                // --- Notification Settings View ---
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8 space-y-8">
                    {isSettingsLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-8 max-w-2xl mx-auto">
                            {/* Email Settings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-indigo-600" />
                                        通知メール設定
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${notificationSettings.notify_email_enabled ? 'text-indigo-600' : 'text-zinc-400'}`}>
                                            {notificationSettings.notify_email_enabled ? '有効' : '無効'}
                                        </span>
                                        <button
                                            onClick={() => setNotificationSettings(p => ({ ...p, notify_email_enabled: !p.notify_email_enabled }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.notify_email_enabled ? 'bg-indigo-600' : 'bg-zinc-200'
                                                }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.notify_email_enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl border transition-colors ${notificationSettings.notify_email_enabled ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-50/50 border-zinc-100 opacity-60'}`}>
                                    <div className="space-y-4">
                                        <label className="text-sm font-medium text-zinc-700">通知先メールアドレス</label>

                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="example@ailuna.net"
                                                disabled={!notificationSettings.notify_email_enabled}
                                                className="flex-1 text-sm border-zinc-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-zinc-100"
                                            />
                                            <button
                                                onClick={handleAddEmail}
                                                disabled={!notificationSettings.notify_email_enabled || !newEmail}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {notificationSettings.notify_emails.map((email) => (
                                                <div key={email} className="flex items-center justify-between p-3 bg-white rounded-lg border border-zinc-200 shadow-sm">
                                                    <span className="text-sm text-zinc-700">{email}</span>
                                                    <button
                                                        onClick={() => handleRemoveEmail(email)}
                                                        disabled={!notificationSettings.notify_email_enabled}
                                                        className="text-zinc-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {notificationSettings.notify_emails.length === 0 && (
                                                <div className="text-sm text-zinc-400 text-center py-2">
                                                    メールアドレスが登録されていません
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LINE Settings */}
                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                        <span className="text-[#06C755] font-bold">LINE</span>
                                        通知設定
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${notificationSettings.notify_line_enabled ? 'text-[#06C755]' : 'text-zinc-400'}`}>
                                            {notificationSettings.notify_line_enabled ? '有効' : '無効'}
                                        </span>
                                        <button
                                            onClick={() => setNotificationSettings(p => ({ ...p, notify_line_enabled: !p.notify_line_enabled }))}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationSettings.notify_line_enabled ? 'bg-[#06C755]' : 'bg-zinc-200'
                                                }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationSettings.notify_line_enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                                    <p className="text-sm text-zinc-500 mb-2">
                                        LINE通知機能は現在開発中です。
                                    </p>
                                    <p className="text-xs text-zinc-400">
                                        今後のアップデートで店舗公式LINEへの通知が可能になります。
                                    </p>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-6 border-t border-zinc-100 flex justify-end">
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={isSavingSettings}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSavingSettings && <Loader2 className="h-4 w-4 animate-spin" />}
                                    設定を保存する
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'form' && (
                // --- Form Field Settings View ---
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 md:p-8 space-y-8">
                    {isFieldsLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-zinc-900">
                                    予約フォーム質問項目
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleInitDefaults}
                                        className="text-xs sm:text-sm px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors"
                                    >
                                        デフォルト項目追加
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditBuffer({
                                                enabled: true,
                                                required: false,
                                                field_type: 'text'
                                            })
                                            setShowCreateForm(true)
                                            setEditingFieldId(null)
                                        }}
                                        className="text-xs sm:text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        新規追加
                                    </button>
                                </div>
                            </div>

                            {formFields.length === 0 ? (
                                <div className="py-12 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
                                    <p className="text-zinc-400 mb-4">質問項目が設定されていません</p>
                                    <button
                                        onClick={handleInitDefaults}
                                        className="text-indigo-600 font-medium hover:underline text-sm"
                                    >
                                        デフォルト項目テンプレートを読み込む
                                    </button>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {formFields.map((field, index) => {
                                        const isEditing = editingFieldId === field.id

                                        if (isEditing) {
                                            return (
                                                <li key={field.id} className="p-4 bg-zinc-50 border border-indigo-200 rounded-xl shadow-sm ring-1 ring-indigo-100">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="text-xs text-zinc-500 font-medium ml-1">ラベル (表示名)</label>
                                                            <input
                                                                value={editBuffer.label || ''}
                                                                onChange={(e) => setEditBuffer({ ...editBuffer, label: e.target.value })}
                                                                className="w-full text-sm border-zinc-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                                placeholder="例: アレルギー有無"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-zinc-500 font-medium ml-1">キー (システム用)</label>
                                                            <input
                                                                value={editBuffer.field_key || ''}
                                                                onChange={(e) => setEditBuffer({ ...editBuffer, field_key: e.target.value })}
                                                                className="w-full text-sm border-zinc-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs"
                                                                placeholder="例: allergy"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-zinc-500 font-medium ml-1">タイプ</label>
                                                            <select
                                                                value={editBuffer.field_type || 'text'}
                                                                onChange={(e) => setEditBuffer({ ...editBuffer, field_type: e.target.value as ReservationFieldType })}
                                                                className="w-full text-sm border-zinc-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                            >
                                                                <option value="text">テキスト (1行)</option>
                                                                <option value="multiline">テキスト (複数行)</option>
                                                                <option value="number">数値</option>
                                                                <option value="date">日付</option>
                                                                <option value="time">時間</option>
                                                                <option value="select">選択リスト</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex items-center gap-6 pt-6">
                                                            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editBuffer.required || false}
                                                                    onChange={(e) => setEditBuffer({ ...editBuffer, required: e.target.checked })}
                                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                必須項目
                                                            </label>
                                                            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editBuffer.enabled !== false}
                                                                    onChange={(e) => setEditBuffer({ ...editBuffer, enabled: e.target.checked })}
                                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                有効
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {editBuffer.field_type === 'select' && (
                                                        <div className="mb-4">
                                                            <label className="text-xs text-zinc-500 font-medium ml-1">選択肢 (改行区切り)</label>
                                                            <textarea
                                                                value={Array.isArray(editBuffer.options) ? editBuffer.options.join('\n') : ''}
                                                                onChange={(e) => setEditBuffer({ ...editBuffer, options: e.target.value.split('\n').filter(Boolean) })}
                                                                className="w-full text-sm border-zinc-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-24"
                                                                placeholder="選択肢1&#13;&#10;選択肢2&#13;&#10;選択肢3"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg"
                                                        >
                                                            キャンセル
                                                        </button>
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                                                        >
                                                            保存
                                                        </button>
                                                    </div>
                                                </li>
                                            )
                                        }

                                        return (
                                            <li key={field.id} className="group p-4 bg-white border border-zinc-200 rounded-xl hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="flex flex-col gap-1 text-zinc-300">
                                                        <button
                                                            onClick={() => handleMoveField(index, 'up')}
                                                            disabled={index === 0}
                                                            className="hover:text-zinc-600 disabled:opacity-30 p-1"
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMoveField(index, 'down')}
                                                            disabled={index === formFields.length - 1}
                                                            className="hover:text-zinc-600 disabled:opacity-30 p-1"
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-zinc-800">{field.label}</span>
                                                            {!field.enabled && <span className="text-xs bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded">無効</span>}
                                                            {field.required && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">必須</span>}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                                                            <span>KEY: {field.field_key}</span>
                                                            <span className="w-px h-3 bg-zinc-300" />
                                                            <span>TYPE: {field.field_type}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 justify-end sm:opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleStartEdit(field)}
                                                        className="p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg"
                                                        title="編集"
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteField(field.id)}
                                                        className="p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                                                        title="削除"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}

                            {/* Create Form Modalish inline */}
                            {showCreateForm && (
                                <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in slide-in-from-top-4">
                                    <h4 className="font-bold text-indigo-900 mb-4">新規項目を追加</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="text-xs text-indigo-600 font-medium ml-1">ラベル (表示名)</label>
                                            <input
                                                value={editBuffer.label || ''}
                                                onChange={(e) => setEditBuffer({ ...editBuffer, label: e.target.value })}
                                                className="w-full text-sm border-indigo-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="例: 年齢"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-indigo-600 font-medium ml-1">キー (システム用)</label>
                                            <input
                                                value={editBuffer.field_key || ''}
                                                onChange={(e) => setEditBuffer({ ...editBuffer, field_key: e.target.value })}
                                                className="w-full text-sm border-indigo-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-xs"
                                                placeholder="例: age"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-indigo-600 font-medium ml-1">タイプ</label>
                                            <select
                                                value={editBuffer.field_type || 'text'}
                                                onChange={(e) => setEditBuffer({ ...editBuffer, field_type: e.target.value as ReservationFieldType })}
                                                className="w-full text-sm border-indigo-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="text">テキスト (1行)</option>
                                                <option value="multiline">テキスト (複数行)</option>
                                                <option value="number">数値</option>
                                                <option value="date">日付</option>
                                                <option value="time">時間</option>
                                                <option value="select">選択リスト</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-6 pt-6">
                                            <label className="flex items-center gap-2 text-sm text-indigo-900 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editBuffer.required || false}
                                                    onChange={(e) => setEditBuffer({ ...editBuffer, required: e.target.checked })}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                必須項目
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-indigo-900 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editBuffer.enabled !== false}
                                                    onChange={(e) => setEditBuffer({ ...editBuffer, enabled: e.target.checked })}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                有効
                                            </label>
                                        </div>
                                    </div>

                                    {editBuffer.field_type === 'select' && (
                                        <div className="mb-4">
                                            <label className="text-xs text-indigo-600 font-medium ml-1">選択肢 (改行区切り)</label>
                                            <textarea
                                                value={Array.isArray(editBuffer.options) ? editBuffer.options.join('\n') : ''}
                                                onChange={(e) => setEditBuffer({ ...editBuffer, options: e.target.value.split('\n').filter(Boolean) })}
                                                className="w-full text-sm border-indigo-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-24"
                                                placeholder="選択肢1&#13;&#10;選択肢2&#13;&#10;選択肢3"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            onClick={() => {
                                                setShowCreateForm(false)
                                                setEditBuffer({})
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={handleCreateField}
                                            className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                                        >
                                            作成する
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
