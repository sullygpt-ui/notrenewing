import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendAutoReleaseEmail, sendPayoutEmail } from '@/lib/email';
import Stripe from 'stripe';
import { sendPayPalPayout } from '@/lib/paypal/client';

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

    // Find all purchases past their buyer confirmation deadline
    const { data: expiredPurchases, error: fetchError } = await supabase
      .from('purchases')
      .select('*, listings(*)')
      .eq('transfer_status', 'pending')
      .not('transfer_initiated_at', 'is', null)
      .not('buyer_confirmation_deadline', 'is', null)
      .lt('buyer_confirmation_deadline', new Date().toISOString());

    if (fetchError) {
      console.error('Failed to fetch expired purchases:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
    }

    if (!expiredPurchases || expiredPurchases.length === 0) {
      return NextResponse.json({ message: 'No expired transfers to process', processed: 0 });
    }

    const results = [];

    for (const purchase of expiredPurchases) {
      const listing = purchase.listings as any;

      try {
        // Update purchase status to completed (auto-released)
        const { error: updateError } = await supabase
          .from('purchases')
          .update({
            transfer_status: 'completed',
            transfer_confirmed_at: new Date().toISOString(),
            auto_released: true,
          })
          .eq('id', purchase.id);

        if (updateError) {
          console.error(`Failed to update purchase ${purchase.id}:`, updateError);
          results.push({ id: purchase.id, success: false, error: 'Update failed' });
          continue;
        }

        // Get seller info and payout preferences
        const { data: seller } = await supabase.auth.admin.getUserById(listing.seller_id);
        const { data: sellerProfile } = await supabase
          .from('profiles')
          .select('stripe_account_id, paypal_email, payout_method')
          .eq('id', listing.seller_id)
          .single();

        // Calculate payout amount
        const payoutAmount = purchase.seller_payout || (purchase.amount_paid - (purchase.processing_fee || 0));
        let payoutSuccess = false;
        let payoutMethod: 'stripe' | 'paypal' | null = null;

        const preferredMethod = sellerProfile?.payout_method;

        // Try PayPal if preferred
        if (preferredMethod === 'paypal' && sellerProfile?.paypal_email) {
          try {
            const result = await sendPayPalPayout(
              sellerProfile.paypal_email,
              payoutAmount,
              purchase.id,
              `Auto-released payout for ${listing.domain_name}`
            );

            if (result.success) {
              payoutSuccess = true;
              payoutMethod = 'paypal';

              await supabase.from('payouts').insert({
                seller_id: listing.seller_id,
                amount: payoutAmount,
                status: 'completed',
                payout_method: 'paypal',
                paypal_payout_id: result.payoutBatchId || null,
                processed_at: new Date().toISOString(),
              });
            }
          } catch (paypalError) {
            console.error('PayPal payout error:', paypalError);
          }
        }

        // Try Stripe if preferred or as fallback
        if (!payoutSuccess && sellerProfile?.stripe_account_id) {
          try {
            const transfer = await stripe.transfers.create({
              amount: payoutAmount,
              currency: 'usd',
              destination: sellerProfile.stripe_account_id,
              transfer_group: purchase.id,
              metadata: {
                purchase_id: purchase.id,
                domain_name: listing.domain_name,
                auto_released: 'true',
              },
            });

            payoutSuccess = true;
            payoutMethod = 'stripe';

            await supabase.from('payouts').insert({
              seller_id: listing.seller_id,
              amount: payoutAmount,
              status: 'completed',
              payout_method: 'stripe',
              stripe_transfer_id: transfer.id,
              processed_at: new Date().toISOString(),
            });
          } catch (stripeError) {
            console.error('Stripe payout error:', stripeError);
          }
        }

        // Send emails
        sendAutoReleaseEmail(purchase.buyer_email, listing.domain_name).catch(console.error);

        if (seller?.user?.email && payoutSuccess) {
          sendPayoutEmail(seller.user.email, payoutAmount, listing.domain_name).catch(console.error);
        }

        results.push({
          id: purchase.id,
          domain: listing.domain_name,
          success: true,
          payoutProcessed: payoutSuccess,
          payoutMethod,
        });
      } catch (err) {
        console.error(`Error processing purchase ${purchase.id}:`, err);
        results.push({ id: purchase.id, success: false, error: 'Processing error' });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} expired transfers`,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Auto-release cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
