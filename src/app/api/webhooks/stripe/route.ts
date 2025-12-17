import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/utils/stripe/server'
import { createAdminClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing')
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error: any) {
        console.error(`Webhook signature verification failed: ${error.message}`)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId || session.client_reference_id

        if (userId) {
            const supabase = await createAdminClient()

            // Update user profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    is_subscribed: true,
                    stripe_customer_id: session.customer as string,
                })
                .eq('id', userId)

            if (profileError) {
                console.error('Error updating profile:', profileError)
                return NextResponse.json({ error: 'Error updating profile' }, { status: 500 })
            }

            // Claim phone number if logic exists
            try {
                // Check if we can claim a phone number using rpc
                const { error: rpcError } = await supabase.rpc('claim_phone_number', {
                    user_id_input: userId,
                })

                if (rpcError) {
                    // Log but don't fail the webhook if phone claim fails (it might be optional or out of numbers)
                    console.warn('Failed to claim phone number or function missing:', rpcError.message)
                } else {
                    console.log('Phone number claimed successfully for user:', userId)
                }
            } catch (err) {
                console.warn('claim_phone_number RPC call exception:', err)
            }
        }
    }

    return NextResponse.json({ received: true })
}
