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
    const fullName = formData.get('fullName') as string
    const accountName = formData.get('accountName') as string

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (authError) {
        console.error('Signup error:', authError)
        return { error: '登録に失敗しました。別のメールアドレスをお試しください。' }
    }

    // Update profiles table with full name and account name
    if (authData.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                account_name: accountName,
            })
            .eq('id', authData.user.id)

        if (profileError) {
            console.error('Profile update error:', profileError)
            // Note: User is created but profile update failed
            // They can still login, but may need to set these fields later
        }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function resetPassword(formData: FormData): Promise<{ error: string } | { success: true }> {
    const supabase = await createClient()
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
