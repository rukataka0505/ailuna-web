'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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
