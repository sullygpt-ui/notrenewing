import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return _stripe;
}

// For backward compatibility
export const stripe = {
  get checkout() {
    return getStripe().checkout;
  },
  get paymentIntents() {
    return getStripe().paymentIntents;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

export const PRICES = {
  DOMAIN_PURCHASE: 9900, // $99 in cents
  LISTING_FEE: 100, // $1 in cents
  SPONSORSHIP_7_DAYS: 1000, // $10
  SPONSORSHIP_30_DAYS: 2500, // $25
};

export async function createCheckoutSession({
  listingId,
  domainName,
  buyerEmail,
  successUrl,
  cancelUrl,
}: {
  listingId: string;
  domainName: string;
  buyerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: buyerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: domainName,
            description: 'Domain purchase',
          },
          unit_amount: PRICES.DOMAIN_PURCHASE,
        },
        quantity: 1,
      },
    ],
    metadata: {
      listing_id: listingId,
      domain_name: domainName,
      type: 'domain_purchase',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

export async function createListingFeePaymentIntent({
  sellerId,
  domainCount,
}: {
  sellerId: string;
  domainCount: number;
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: PRICES.LISTING_FEE * domainCount,
    currency: 'usd',
    metadata: {
      seller_id: sellerId,
      domain_count: domainCount.toString(),
      type: 'listing_fee',
    },
  });

  return paymentIntent;
}
