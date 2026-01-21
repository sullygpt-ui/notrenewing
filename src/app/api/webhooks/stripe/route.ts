import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === 'domain_purchase') {
          const listingId = session.metadata.listing_id;
          const buyerEmail = session.customer_email || session.customer_details?.email;

          // Calculate fees
          const amountPaid = session.amount_total || 9900;
          const processingFee = Math.round(amountPaid * 0.029 + 30); // ~2.9% + $0.30
          const sellerPayout = amountPaid - processingFee;

          // Create purchase record
          const { error: purchaseError } = await supabase
            .from('purchases')
            .insert({
              listing_id: listingId,
              buyer_email: buyerEmail,
              stripe_payment_intent_id: session.payment_intent as string,
              amount_paid: amountPaid,
              processing_fee: processingFee,
              seller_payout: sellerPayout,
              transfer_status: 'pending',
              transfer_deadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
            } as any);

          if (purchaseError) {
            console.error('Failed to create purchase:', purchaseError);
            throw purchaseError;
          }

          // Update listing status to sold
          const { error: listingError } = await supabase
            .from('listings')
            .update({ status: 'sold' })
            .eq('id', listingId);

          if (listingError) {
            console.error('Failed to update listing:', listingError);
            throw listingError;
          }

          // TODO: Send email notifications to buyer and seller
        }

        if (session.metadata?.type === 'listing_fee') {
          // Handle listing fee payment
          const sellerId = session.metadata.seller_id;
          const domainCount = parseInt(session.metadata.domain_count || '0');

          // Update listing fee record
          const { error } = await supabase
            .from('listing_fees')
            .update({ status: 'paid' })
            .eq('stripe_payment_intent_id', session.payment_intent);

          if (error) {
            console.error('Failed to update listing fee:', error);
          }

          // Activate the pending listings
          // This would require tracking which listings belong to which fee
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        // Handle failed payment if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
