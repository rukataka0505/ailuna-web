'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function updatePassword(formData: FormData): Promise<{ error: string } | undefined> {
    const supabase = await createClient()

    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password,
    })

    if (error) {
        console.error('Update password error:', error)
        return { error: 'パスワードの更新に失敗しました。もう一度お試しください。' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
