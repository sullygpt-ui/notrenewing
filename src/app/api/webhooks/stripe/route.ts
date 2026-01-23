import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';
import { sendPurchaseConfirmationEmail, sendDomainSoldEmail, sendVerificationEmail } from '@/lib/email';

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

          // Fetch listing with seller info for emails
          const { data: listingData } = await supabase
            .from('listings')
            .select('domain_name, seller_id')
            .eq('id', listingId)
            .single();

          // Update listing status to sold
          const { error: listingError } = await supabase
            .from('listings')
            .update({ status: 'sold' })
            .eq('id', listingId);

          if (listingError) {
            console.error('Failed to update listing:', listingError);
            throw listingError;
          }

          // Get seller email from auth.users
          if (listingData && buyerEmail) {
            const { data: sellerData } = await supabase.auth.admin.getUserById(
              listingData.seller_id
            );

            const sellerEmail = sellerData?.user?.email;
            const domainName = listingData.domain_name;

            // Send emails (don't wait, fire and forget)
            if (sellerEmail) {
              sendDomainSoldEmail(sellerEmail, domainName, buyerEmail, sellerPayout).catch(
                (err) => console.error('Failed to send sold email to seller:', err)
              );
            }

            sendPurchaseConfirmationEmail(buyerEmail, domainName, sellerEmail || 'seller').catch(
              (err) => console.error('Failed to send purchase confirmation to buyer:', err)
            );
          }
        }

        if (session.metadata?.type === 'listing_fee') {
          // Handle listing fee payment
          const sellerId = session.metadata.seller_id;
          const listingIds = JSON.parse(session.metadata.listing_ids || '[]');

          if (listingIds.length > 0) {
            // Update listings from pending_payment to pending_verification
            const { error: updateError } = await supabase
              .from('listings')
              .update({ status: 'pending_verification' })
              .in('id', listingIds)
              .eq('seller_id', sellerId);

            if (updateError) {
              console.error('Failed to update listings:', updateError);
              throw updateError;
            }

            // Fetch listings with tokens to send verification emails
            const { data: listings } = await supabase
              .from('listings')
              .select('id, domain_name, verification_token')
              .in('id', listingIds);

            // Get seller email
            const { data: sellerData } = await supabase.auth.admin.getUserById(sellerId);
            const sellerEmail = sellerData?.user?.email;

            // Send verification emails for each domain
            if (sellerEmail && listings) {
              for (const listing of listings) {
                sendVerificationEmail(
                  sellerEmail,
                  listing.domain_name,
                  listing.verification_token,
                  listing.id
                ).catch((err) =>
                  console.error(`Failed to send verification email for ${listing.domain_name}:`, err)
                );
              }
            }
          }
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
