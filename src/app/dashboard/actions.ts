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
