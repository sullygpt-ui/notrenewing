import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // Find purchases where:
    // - transfer_status is pending
    // - transfer_initiated_at is NULL (seller hasn't submitted)
    // - transfer_deadline has passed
    const { data: expiredPurchases, error: fetchError } = await supabase
      .from('purchases')
      .select('*, listings(*)')
      .eq('transfer_status', 'pending')
      .is('transfer_initiated_at', null)
      .not('transfer_deadline', 'is', null)
      .lt('transfer_deadline', new Date().toISOString());

    if (fetchError) {
      console.error('Failed to fetch expired purchases:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
    }

    if (!expiredPurchases || expiredPurchases.length === 0) {
      return NextResponse.json({ message: 'No expired seller deadlines to process', processed: 0 });
    }

    const results = [];

    for (const purchase of expiredPurchases) {
      const listing = purchase.listings as any;

      try {
        // Process refund via Stripe
        let refundSuccess = false;
        let refundId: string | null = null;

        if (purchase.stripe_payment_intent_id) {
          try {
            const refund = await stripe.refunds.create({
              payment_intent: purchase.stripe_payment_intent_id,
              reason: 'requested_by_customer',
              metadata: {
                purchase_id: purchase.id,
                reason: 'seller_deadline_missed',
                domain_name: listing.domain_name,
              },
            });
            refundSuccess = true;
            refundId = refund.id;
          } catch (stripeError) {
            console.error(`Stripe refund failed for purchase ${purchase.id}:`, stripeError);
          }
        }

        // Update purchase status
        const { error: updatePurchaseError } = await supabase
          .from('purchases')
          .update({
            transfer_status: 'failed',
            dispute_reason: 'Seller did not submit transfer information within 72 hours',
            dispute_opened_at: new Date().toISOString(),
            dispute_resolved_at: new Date().toISOString(),
            dispute_outcome: 'buyer_refunded',
          })
          .eq('id', purchase.id);

        if (updatePurchaseError) {
          console.error(`Failed to update purchase ${purchase.id}:`, updatePurchaseError);
          results.push({ id: purchase.id, success: false, error: 'Update failed' });
          continue;
        }

        // Reactivate the listing so it can sell again
        const { error: updateListingError } = await supabase
          .from('listings')
          .update({
            status: 'active',
          })
          .eq('id', listing.id);

        if (updateListingError) {
          console.error(`Failed to reactivate listing ${listing.id}:`, updateListingError);
        }

        // Get seller info for email
        const { data: seller } = await supabase.auth.admin.getUserById(listing.seller_id);

        // Send email to buyer
        sendEmail({
          to: purchase.buyer_email,
          template: 'transfer_deadline_refund_buyer',
          data: {
            buyerName: purchase.buyer_email.split('@')[0],
            domainName: listing.domain_name,
            refundAmount: `$${(purchase.amount_paid / 100).toFixed(2)}`,
          },
        }).catch(console.error);

        // Send email to seller
        if (seller?.user?.email) {
          sendEmail({
            to: seller.user.email,
            template: 'transfer_deadline_refund_seller',
            data: {
              sellerName: seller.user.email.split('@')[0],
              domainName: listing.domain_name,
            },
          }).catch(console.error);
        }

        results.push({
          id: purchase.id,
          domain: listing.domain_name,
          success: true,
          refunded: refundSuccess,
          refundId,
          listingReactivated: !updateListingError,
        });
      } catch (err) {
        console.error(`Error processing purchase ${purchase.id}:`, err);
        results.push({ id: purchase.id, success: false, error: 'Processing error' });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} expired seller deadlines`,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Seller deadline cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
