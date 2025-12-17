'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export type StoreNotificationSettings = {
    notify_email_enabled: boolean
    notify_emails: string[]
    notify_line_enabled: boolean
    line_target_id?: string | null
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
        .select('notify_email_enabled, notify_emails, notify_line_enabled, line_target_id')
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

export async function createLineLinkToken() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Generate readable code
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
    const codeLen = 6
    const maxRetries = 5

    for (let i = 0; i < maxRetries; i++) {
        const randomValues = randomBytes(codeLen)
        let tokenCode = ''
        for (let j = 0; j < codeLen; j++) {
            tokenCode += chars[randomValues[j] % chars.length]
        }

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 mins

        const { error } = await supabase
            .from('line_link_tokens')
            .insert({
                user_id: user.id,
                token: tokenCode,
                expires_at: expiresAt
            })

        if (!error) {
            return { token_code: tokenCode, expires_at: expiresAt }
        }
        // If UNIQUE failure, retry. Else return error
        if (error.code !== '23505') { // 23505 = unique_violation // Postgres
            console.error('Error creating token:', error)
            return { error: 'コードの発行に失敗しました。' }
        }
    }
    return { error: 'コードの発行に失敗しました(リトライ上限)。' }
}

export async function getActiveLineLinkToken() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('line_link_tokens')
        .select('token, expires_at')
        .eq('user_id', user.id)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error) return null

    return { token_code: data.token, expires_at: data.expires_at }
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
