'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function updateUserPrompts(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const greeting_message = formData.get('greeting_message') as string
    const business_description = formData.get('business_description') as string

    const { error } = await supabase
        .from('user_prompts')
        .upsert(
            {
                user_id: user.id,
                greeting_message,
                business_description,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'user_id' }
        )

    if (error) {
        console.error('Error updating prompts:', error)
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
