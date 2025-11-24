import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/server';

export async function POST(request: Request) {
    try {
        // 1. Supabase Auth でログインユーザーを取得
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        // 2. リクエストの origin を取得（success_url, cancel_url に使用）
        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // 3. 環境変数から Price ID を取得
        const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
        if (!priceId) {
            console.error('NEXT_PUBLIC_STRIPE_PRICE_ID is not set');
            return NextResponse.json(
                { error: 'Server configuration error. Please contact support.' },
                { status: 500 }
            );
        }

        const usagePriceId = process.env.NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID;

        // 4. line_items を動的に構築
        const lineItems = [
            {
                price: priceId,
                quantity: 1,
            },
        ];

        // 従量課金IDが設定されている場合は追加
        if (usagePriceId) {
            lineItems.push({
                price: usagePriceId,
                quantity: 1,
            });
        } else {
            console.warn('NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID is not set. Usage-based billing will not be enabled.');
        }

        // 5. Stripe Checkout Session を作成
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: lineItems,
            customer_email: user.email,
            client_reference_id: user.id, // Webhook での紐付けに使用
            metadata: {
                userId: user.id,
            },
            success_url: `${origin}/dashboard?payment=success`,
            cancel_url: `${origin}/dashboard?payment=cancelled`,
        });

        // 6. セッション URL を返す
        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error('Checkout session creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session. Please try again.' },
            { status: 500 }
        );
    }
}
