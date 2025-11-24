import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe } from '@/utils/stripe/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    console.log("\n🔴🔴🔴 DEBUG START 🔴🔴🔴");

    // 1. 今サーバーがどこにいるか確認
    const cwd = process.cwd();
    console.log(`📍 Current Directory: ${cwd}`);

    // 2. .env.local を探す
    const envPath = path.join(cwd, '.env.local');
    const fileExists = fs.existsSync(envPath);
    console.log(`🔎 .env.local path: ${envPath}`);
    console.log(`📁 File Exists?: ${fileExists ? "✅ YES" : "❌ NO"}`);

    // 3. ファイルの中身をチラ見する（キーが含まれているか）
    if (fileExists) {
        try {
            const content = fs.readFileSync(envPath, 'utf-8');
            const hasSecretKey = content.includes('STRIPE_SECRET_KEY=sk_test_');
            console.log(`📝 Content check: STRIPE_SECRET_KEY is ${hasSecretKey ? "✅ FOUND in file" : "❌ NOT FOUND in file"}`);
        } catch (e) {
            console.log(`⚠️ Cannot read file: ${e}`);
        }
    } else {
        // 親ディレクトリも探してみる
        const parentPath = path.join(cwd, '..', '.env.local');
        if (fs.existsSync(parentPath)) {
            console.log(`💡 FOUND in parent directory: ${parentPath}`);
            console.log("   (You might need to move it to the 'web' folder)");
        }
    }

    // 4. 環境変数のロード状況
    console.log(`🔑 process.env.STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? "✅ LOADED" : "❌ UNDEFINED"}`);
    console.log("🔴🔴🔴 DEBUG END 🔴🔴🔴\n");

    try {
        // ここから通常の処理
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Stripeインスタンス取得（ここでエラーになる可能性が高い）
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY is missing in process.env");
        }

        const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
        const usagePriceId = process.env.NEXT_PUBLIC_STRIPE_USAGE_PRICE_ID;

        if (!priceId) throw new Error("NEXT_PUBLIC_STRIPE_PRICE_ID is missing");

        const lineItems = [{ price: priceId, quantity: 1 }];
        if (usagePriceId) {
            lineItems.push({ price: usagePriceId, quantity: 1 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: lineItems,
            customer_email: user.email,
            client_reference_id: user.id,
            metadata: { userId: user.id },
            success_url: `${origin}/dashboard?payment=success`,
            cancel_url: `${origin}/dashboard?payment=cancelled`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Checkout error details:', error);
        return NextResponse.json(
            { error: error.message || 'Checkout failed' },
            { status: 500 }
        );
    }
}