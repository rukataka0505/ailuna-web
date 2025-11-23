'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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
