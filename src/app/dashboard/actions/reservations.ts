'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendSMS } from '@/utils/twilio'

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

export async function approveReservationRequest(
    id: string,
    internalNote?: string,
    customerMessage?: string
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

    // 既に完了している場合は何もしない（あるいはエラーを返すか、UIが制御している前提で進める）
    // 要件：statusがpending以外ならブロック
    if (request.status !== 'pending') {
        return { error: '既に処理済みの予約です。' }
    }

    const { error } = await supabase
        .from('reservation_requests')
        .update({
            status: 'approved',
            decided_at: new Date().toISOString(),
            decided_by: user.id,
            internal_note: internalNote,
            customer_message: customerMessage,
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error approving reservation:', error)
        return { error: '承認に失敗しました。' }
    }

    // SMS送信 (失敗してもエラーにはしないがログに残す)
    // ガード：送信済みなら送らない
    if (request.sms_sent_at) {
        revalidatePath('/dashboard')
        return { success: '予約を承認しました。（SMSは既に送信済みです）' }
    }
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

        // Fetch SMS templates
        const { data: userPrompt } = await supabase
            .from('user_prompts')
            .select('config_metadata')
            .eq('user_id', user.id)
            .single()

        const templates = (userPrompt?.config_metadata as any)?.sms_templates
        let body = ''

        if (templates?.approved) {
            // Use Template
            body = templates.approved
                .replace('{{dateTime}}', dateTimeDisplay)
                .replace('{{partySize}}', partySizeStr)
                .replace('{{extraMessage}}', customerMessage || '')

            // Cleanup empty placeholders if any remained (optional, but good for cleanliness if easy. Here we just replaced known ones)
        } else {
            // Default
            body = `ご予約を承りました。${dateTimeDisplay}${partySizeStr}で確定しました。`
            if (customerMessage) {
                body += `\n\n${customerMessage}`
            }
        }
        const fromNumber = profile?.phone_number || undefined

        if (request.customer_phone && !request.sms_sent_at) {
            await sendSMS(request.customer_phone, body, fromNumber)

            // Log SMS sent
            await supabase
                .from('reservation_requests')
                .update({
                    sms_body_sent: body,
                    sms_sent_at: new Date().toISOString()
                })
                .eq('id', id)
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
    internalNote?: string,
    customerMessage?: string
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

    // 要件：statusがpending以外ならブロック
    if (request.status !== 'pending') {
        return { error: '既に処理済みの予約です。' }
    }

    const { error } = await supabase
        .from('reservation_requests')
        .update({
            status: 'rejected',
            decided_at: new Date().toISOString(),
            decided_by: user.id,
            decision_reason: reason,
            internal_note: internalNote,
            customer_message: customerMessage,
        })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error rejecting reservation:', error)
        return { error: '却下に失敗しました。' }
    }

    // SMS送信
    // ガード：送信済みなら送らない
    if (request.sms_sent_at) {
        revalidatePath('/dashboard')
        return { success: '予約を却下しました。（SMSは既に送信済みです）' }
    }
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('phone_number')
            .eq('id', user.id)
            .single()

        // Fetch SMS templates
        const { data: userPrompt } = await supabase
            .from('user_prompts')
            .select('config_metadata')
            .eq('user_id', user.id)
            .single()

        const templates = (userPrompt?.config_metadata as any)?.sms_templates
        let body = ''

        if (templates?.rejected) {
            // Use Template
            body = templates.rejected
                .replace('{{reason}}', reason)
                .replace('{{extraMessage}}', customerMessage || '')
        } else {
            // Default
            body = `申し訳ありません。ご希望の日時はお受けできませんでした。${reason ? '\n' + reason : ''}`
            if (customerMessage) {
                body += `\n\n${customerMessage}`
            }
        }
        const fromNumber = profile?.phone_number || undefined

        if (request.customer_phone && !request.sms_sent_at) {
            await sendSMS(request.customer_phone, body, fromNumber)

            // Log SMS sent
            await supabase
                .from('reservation_requests')
                .update({
                    sms_body_sent: body,
                    sms_sent_at: new Date().toISOString()
                })
                .eq('id', id)
        }
    } catch (smsError) {
        console.error('SMS sending failed:', smsError)
        return { success: '予約を却下しました。SMS通知の送信に失敗しました。' }
    }

    revalidatePath('/dashboard')
    return { success: '予約を却下し、SMS通知を送信しました。' }
}
