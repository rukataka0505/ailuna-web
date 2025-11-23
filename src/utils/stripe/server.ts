import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is missing. Please set it in your .env.local file.');
    }

    if (!stripeInstance) {
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-11-17.clover' as any,
            typescript: true,
        });
    }

    return stripeInstance;
};

// For backward compatibility
export const stripe = new Proxy({} as Stripe, {
    get: (target, prop) => {
        const stripeClient = getStripe();
        return (stripeClient as any)[prop];
    }
});
