'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Note: Future expansions might include 'datetime' or 'phone', but currently UI handles these.
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

// Initialize defaults (Smart Merge)
export async function initializeDefaultFields() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch existing field keys
    const { data: existingFields } = await supabase
        .from('reservation_form_fields')
        .select('field_key')
        .eq('user_id', user.id)

    const existingKeys = new Set(existingFields?.map(f => f.field_key) || [])

    const defaults = [
        { field_key: 'customer_name', label: 'お名前', field_type: 'text', required: true, enabled: true, display_order: 1 },
        { field_key: 'party_size', label: '人数', field_type: 'number', required: true, enabled: true, display_order: 2 },
        { field_key: 'requested_date', label: '希望日', field_type: 'date', required: true, enabled: true, display_order: 3 },
        { field_key: 'requested_time', label: '希望時間', field_type: 'time', required: true, enabled: true, display_order: 4 },
        { field_key: 'notes', label: '備考・ご要望', field_type: 'multiline', required: false, enabled: true, display_order: 5 },
    ]

    // Filter to find missing defaults
    const missingDefaults = defaults.filter(d => !existingKeys.has(d.field_key))

    if (missingDefaults.length === 0) {
        return { success: 'すべてのデフォルト項目は既に存在します。' }
    }

    // Insert missing
    // Smart merge strategy: append to end.
    const { data: maxOrderData } = await supabase
        .from('reservation_form_fields')
        .select('display_order')
        .eq('user_id', user.id)
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

    let nextOrder = (maxOrderData?.display_order || 0) + 1

    const inserts = missingDefaults.map((d, index) => ({
        ...d,
        user_id: user.id,
        display_order: nextOrder + index
    }))

    const { error } = await supabase
        .from('reservation_form_fields')
        .insert(inserts)

    if (error) {
        console.error('Error initializing fields:', error)
        return { error: '項目の追加に失敗しました。' }
    }

    revalidatePath('/dashboard')
    const addedNames = missingDefaults.map(d => d.label).join('、')
    return { success: `不足していた項目を追加しました（${addedNames}）。` }
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
