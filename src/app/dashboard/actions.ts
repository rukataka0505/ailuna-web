'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sendSMS } from '@/utils/twilio'

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

import { ConfigMetadata } from '@/types/agent'

export async function saveAgentSettings(
    systemPrompt: string,
    configMetadata: ConfigMetadata
) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { error } = await supabase
        .from('user_prompts')
        .upsert(
            {
                user_id: user.id,
                system_prompt: systemPrompt,
                config_metadata: configMetadata, // Note: DB schema update required for this column if not exists, or it might be JSONB
                updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
        )

    if (error) {
        console.error('Error saving agent settings:', error)
        return { error: '設定の保存に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '設定を保存しました。' }
}

export async function fetchUniqueCallerNumbers() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    // caller_numberのみを取得
    const { data, error } = await supabase
        .from('call_logs')
        .select('caller_number')
        .eq('user_id', user.id)
        .not('caller_number', 'is', null)
        .order('caller_number', { ascending: true })

    if (error) {
        console.error('Error fetching unique caller numbers:', error)
        return []
    }

    // 重複を除去して配列を返す
    const uniqueNumbers = Array.from(new Set(data.map(item => item.caller_number))).filter(Boolean) as string[]
    return uniqueNumbers
}

export type FilterParams = {
    startDate?: string
    endDate?: string
    callerNumber?: string
}

export async function fetchCallLogsPaginated(
    offset: number,
    limit: number,
    filters: FilterParams = {}
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    let query = supabase
        .from('call_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

    // フィルター適用
    if (filters.startDate) {
        // 開始日の00:00:00から
        query = query.gte('created_at', `${filters.startDate}T00:00:00`)
    }
    if (filters.endDate) {
        // 終了日の23:59:59まで
        query = query.lte('created_at', `${filters.endDate}T23:59:59`)
    }
    if (filters.callerNumber && filters.callerNumber !== 'all') {
        query = query.eq('caller_number', filters.callerNumber)
    }

    // 常に作成日時降順（新しい順）
    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching call logs:', error)
        throw new Error('Failed to fetch call logs')
    }

    return { logs: data, count }
}

export type CallMetrics = {
    totalCalls: number
    totalDurationMinutes: number
}

export async function fetchCallMetrics(): Promise<CallMetrics> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { totalCalls: 0, totalDurationMinutes: 0 }
    }

    // 着信対応回数を取得
    const { count, error: countError } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (countError) {
        console.error('Error fetching call metrics (count):', countError)
        return { totalCalls: 0, totalDurationMinutes: 0 }
    }

    // 合計利用時間を取得
    // call_logsテーブルの duration_seconds カラム（秒）を合計し、分単位に変換する
    // duration_seconds が NULL の場合は 0 として扱う
    const { data: durationData, error: durationError } = await supabase
        .from('call_logs')
        .select('duration_seconds')
        .eq('user_id', user.id)

    let totalSeconds = 0
    if (durationError) {
        console.error('Error fetching call metrics (duration):', durationError)
        // エラー時は 0 秒として続行
    } else if (durationData) {
        totalSeconds = durationData.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0)
    }

    // 秒 -> 分（小数点第1位まで）
    const totalDurationMinutes = Number((totalSeconds / 60).toFixed(1))

    return {
        totalCalls: count || 0,
        totalDurationMinutes
    }
}

export async function deleteAgentSettings() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { error } = await supabase
        .from('user_prompts')
        .delete()
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting agent settings:', error)
        return { error: '設定の削除に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '設定を削除しました。' }
}

export async function fetchUserProfile() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('phone_number, account_name')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching user profile:', error)
        return null
    }

    return data
}

// Phase 3: Reservation Requests

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved'

export type ReservationFilterParams = {
    status?: ReservationStatus | 'all'
    startDate?: string
    endDate?: string
}

export async function fetchReservationRequestsPaginated(
    offset: number,
    limit: number,
    filters: ReservationFilterParams = {}
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    let query = supabase
        .from('reservation_requests')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

    // フィルター適用
    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
    }
    if (filters.startDate) {
        query = query.gte('created_at', `${filters.startDate}T00:00:00`)
    }
    if (filters.endDate) {
        query = query.lte('created_at', `${filters.endDate}T23:59:59`)
    }

    // 新しい順
    const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Error fetching reservation requests:', error)
        throw new Error('Failed to fetch reservation requests')
    }

    return { requests: data, count }
}

// Phase 4: Approve / Reject Actions

export async function approveReservationRequest(
    id: string,
    internalNote?: string
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: request, error: fetchError } = await supabase
        .from('reservation_requests')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !request) {
        return { error: '予約情報の取得に失敗しました。' }
    }

    const { error } = await supabase
        .from('reservation_requests')
        .update({
            status: 'approved',
            decided_at: new Date().toISOString(),
            decided_by: user.id,
            internal_note: internalNote,
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure ownership

    if (error) {
        console.error('Error approving reservation:', error)
        return { error: '承認に失敗しました。' }
    }

    // SMS送信 (失敗してもエラーにはしないがログに残す)
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('phone_number')
            .eq('id', user.id)
            .single()

        // 日時の構築: Date型変換せず文字列として処理する
        let dateStr = ''
        if (request.requested_date) {
            const parts = request.requested_date.split('-') // YYYY-MM-DD
            if (parts.length === 3) {
                dateStr = `${Number(parts[1])}/${Number(parts[2])}`
            } else {
                dateStr = request.requested_date
            }
        }

        let timeStr = ''
        if (request.requested_time) {
            // HH:mm:ss -> HH:mm
            timeStr = request.requested_time.substring(0, 5)
        }

        // 構造化データがない場合はテキストでフォールバック
        const dateTimeDisplay = (dateStr && timeStr)
            ? `${dateStr} ${timeStr}`
            : (dateStr || request.requested_datetime_text || '')

        const partySizeStr = request.party_size ? `（人数:${request.party_size}）` : ''

        const body = `ご予約を承りました。${dateTimeDisplay}${partySizeStr}で確定しました。`
        const fromNumber = profile?.phone_number || undefined

        if (request.customer_phone) {
            await sendSMS(request.customer_phone, body, fromNumber)
        }
    } catch (smsError) {
        console.error('SMS sending failed:', smsError)
        return { success: '予約を承認しました。SMS通知の送信に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '予約を承認し、SMS通知を送信しました。' }
}

export async function rejectReservationRequest(
    id: string,
    reason: string,
    internalNote?: string
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: request, error: fetchError } = await supabase
        .from('reservation_requests')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !request) {
        return { error: '予約情報の取得に失敗しました。' }
    }

    const { error } = await supabase
        .from('reservation_requests')
        .update({
            status: 'rejected',
            decided_at: new Date().toISOString(),
            decided_by: user.id,
            decision_reason: reason,
            internal_note: internalNote,
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure ownership

    if (error) {
        console.error('Error rejecting reservation:', error)
        return { error: '却下に失敗しました。' }
    }

    // SMS送信
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('phone_number')
            .eq('id', user.id)
            .single()

        const body = `申し訳ありません。ご希望の日時はお受けできませんでした。${reason ? '\n' + reason : ''}`
        const fromNumber = profile?.phone_number || undefined

        if (request.customer_phone) {
            await sendSMS(request.customer_phone, body, fromNumber)
        }
    } catch (smsError) {
        console.error('SMS sending failed:', smsError)
        return { success: '予約を却下しました。SMS通知の送信に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '予約を却下し、SMS通知を送信しました。' }
}

// Phase 6: Store Notification Settings

export type StoreNotificationSettings = {
    notify_email_enabled: boolean
    notify_emails: string[]
    notify_line_enabled: boolean
}

export async function getStoreNotificationSettings(): Promise<StoreNotificationSettings | null> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data, error } = await supabase
        .from('store_notification_settings')
        .select('notify_email_enabled, notify_emails, notify_line_enabled')
        .eq('user_id', user.id)
        .single()

    if (error) {
        // If not found, return defaults or null. Let's return defaults if it's "PGRST116" (JSON object requested, multiple (or no) results returned)
        if (error.code === 'PGRST116') {
            return {
                notify_email_enabled: false,
                notify_emails: [],
                notify_line_enabled: false
            }
        }
        console.error('Error fetching store settings:', error)
        return null
    }

    return data as StoreNotificationSettings
}

export async function upsertStoreNotificationSettings(
    settings: StoreNotificationSettings
) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('store_notification_settings')
        .upsert({
            user_id: user.id,
            notify_email_enabled: settings.notify_email_enabled,
            notify_emails: settings.notify_emails,
            notify_line_enabled: settings.notify_line_enabled,
            updated_at: new Date().toISOString()
        })

    if (error) {
        console.error('Error saving store settings:', error)
        return { error: '設定の保存に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '通知設定を保存しました。' }
}

// Phase 7: Reservation Form Fields

export type ReservationFieldType = 'text' | 'number' | 'date' | 'time' | 'select' | 'multiline'

export type ReservationField = {
    id: string
    field_key: string
    label: string
    field_type: ReservationFieldType
    required: boolean
    enabled: boolean
    options?: string[] | null // For 'select' type
    display_order: number
}

// Helper to fetch list
export async function listReservationFields(): Promise<ReservationField[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('reservation_form_fields')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })

    if (error) {
        console.error('Error fetching form fields:', error)
        return []
    }

    return data as ReservationField[]
}

// Initialize defaults
export async function initializeDefaultFields() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check if fields already exist
    const { count } = await supabase
        .from('reservation_form_fields')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (count && count > 0) {
        return { error: '既にフィールド設定が存在します。' }
    }

    const defaults = [
        { field_key: 'customer_name', label: 'お名前', field_type: 'text', required: true, enabled: true, display_order: 1 },
        { field_key: 'party_size', label: '人数', field_type: 'number', required: true, enabled: true, display_order: 2 },
        { field_key: 'requested_date', label: '希望日', field_type: 'date', required: true, enabled: true, display_order: 3 },
        { field_key: 'requested_time', label: '希望時間', field_type: 'time', required: true, enabled: true, display_order: 4 },
        { field_key: 'notes', label: '備考・ご要望', field_type: 'multiline', required: false, enabled: true, display_order: 5 },
    ]

    const inserts = defaults.map(d => ({ ...d, user_id: user.id }))

    const { error } = await supabase
        .from('reservation_form_fields')
        .insert(inserts)

    if (error) {
        console.error('Error initializing fields:', error)
        return { error: '初期化に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: 'デフォルト項目を追加しました。' }
}

export async function createReservationField(field: Omit<ReservationField, 'id'>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('reservation_form_fields')
        .insert({
            user_id: user.id,
            field_key: field.field_key,
            label: field.label,
            field_type: field.field_type,
            required: field.required,
            enabled: field.enabled,
            options: field.options,
            display_order: field.display_order
        })

    if (error) {
        console.error('Error creating field:', error)
        return { error: '項目の作成に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '項目を作成しました。' }
}

export async function updateReservationField(id: string, updates: Partial<ReservationField>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('reservation_form_fields')
        .update({
            ...updates,
            // Prevent changing user_id or id via updates spread if checked purely by TS
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating field:', error)
        return { error: '項目の更新に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '項目を更新しました。' }
}

export async function deleteReservationField(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('reservation_form_fields')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting field:', error)
        return { error: '項目の削除に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '項目を削除しました。' }
}

export async function reorderReservationFields(idsInOrder: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // This is not the most efficient way (N updates), but sufficient for small number of fields (usually < 20).
    // Alternative: call a Postgres function or use a single query with case/when if Supabase supports it easily.
    // For simplicity, we loop.
    let hasError = false
    for (let i = 0; i < idsInOrder.length; i++) {
        const { error } = await supabase
            .from('reservation_form_fields')
            .update({ display_order: i + 1 })
            .eq('id', idsInOrder[i])
            .eq('user_id', user.id)

        if (error) {
            console.error(`Error reordering field ${idsInOrder[i]}:`, error)
            hasError = true
        }
    }

    if (hasError) {
        return { error: '並べ替え中にエラーが発生しましたが、一部は反映された可能性があります。' }
    }

    revalidatePath('/dashboard')
    return { success: '並べ替えを保存しました。' }
}
