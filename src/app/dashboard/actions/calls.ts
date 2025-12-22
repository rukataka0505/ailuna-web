'use server'

import { createClient } from '@/utils/supabase/server'

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

    // 一覧表示に必要なカラムのみ取得（transcriptは展開時に別途取得）
    let query = supabase
        .from('call_logs')
        .select('id, created_at, caller_number, duration_seconds, summary', { count: 'exact' })
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

    // 合計利用時間をSQLで計算（スケーラブル）
    const { data: sumData, error: sumError } = await supabase
        .rpc('sum_call_duration_seconds', { target_user_id: user.id })

    let totalSeconds = 0
    if (sumError) {
        console.error('Error fetching call metrics (sum):', sumError)
        // RPCがない場合はフォールバック
        const { data: durationData } = await supabase
            .from('call_logs')
            .select('duration_seconds')
            .eq('user_id', user.id)
        if (durationData) {
            totalSeconds = durationData.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0)
        }
    } else {
        totalSeconds = sumData || 0
    }

    // 秒 -> 分（小数点第1位まで）
    const totalDurationMinutes = Number((totalSeconds / 60).toFixed(1))

    return {
        totalCalls: count || 0,
        totalDurationMinutes
    }
}

/**
 * TranscriptItem型（ConversationViewerと共通）
 */
export type TranscriptItem = {
    role: 'user' | 'assistant'
    text: string
    timestamp: string
}

/**
 * 展開時にトランスクリプトを個別取得（遅延ロード）
 */
export async function fetchCallTranscript(callId: string): Promise<TranscriptItem[] | null> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
        .from('call_logs')
        .select('transcript')
        .eq('id', callId)
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching call transcript:', error)
        return null
    }

    return data?.transcript || null
}
