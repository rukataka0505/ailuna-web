'use server'

import { headers } from 'next/headers'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData): Promise<{ error: string } | undefined> {
    console.log('Login action started')
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        return { error: 'メールアドレスまたはパスワードが間違っています。' }
    }

    console.log('Login success, redirecting...')
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}


export async function signup(formData: FormData): Promise<{ error: string } | { success: true }> {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const lastName = formData.get('lastName') as string
    const firstName = formData.get('firstName') as string
    const accountName = formData.get('accountName') as string
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
    })

    if (error) {
        console.error('Reset password error:', error)
        return { error: 'パスワードリセットに失敗しました。' }
    }

    return { success: true }
}
