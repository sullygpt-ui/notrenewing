import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendTransferCompleteEmail, sendPayoutEmail } from '@/lib/email';
import Stripe from 'stripe';
import { sendPayPalPayout } from '@/lib/paypal/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purchaseId } = body;

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Get purchase and listing info
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*, listings(*)')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.transfer_status === 'completed') {
      return NextResponse.json({ error: 'Transfer already confirmed' }, { status: 400 });
    }

    if (purchase.transfer_status === 'disputed') {
      return NextResponse.json({ error: 'Cannot confirm a disputed transfer' }, { status: 400 });
    }

    const listing = purchase.listings as any;

    // Update purchase status
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        transfer_status: 'completed',
        transfer_confirmed_at: new Date().toISOString(),
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('Failed to update purchase:', updateError);
      return NextResponse.json({ error: 'Failed to confirm transfer' }, { status: 500 });
    }

    // Get seller info and payout preferences
    const { data: seller } = await supabase.auth.admin.getUserById(listing.seller_id);
    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('stripe_account_id, paypal_email, payout_method')
      .eq('id', listing.seller_id)
      .single();

    // Send confirmation email to buyer
    sendTransferCompleteEmail(purchase.buyer_email, listing.domain_name).catch(console.error);

    // Calculate payout amount
    const payoutAmount = purchase.seller_payout || (purchase.amount_paid - (purchase.processing_fee || 0));
    let payoutSuccess = false;
    let payoutMethod: 'stripe' | 'paypal' | null = null;
    let payoutId: string | null = null;

    // Determine payout method
    const preferredMethod = sellerProfile?.payout_method;

    // Try PayPal if preferred and configured
    if (preferredMethod === 'paypal' && sellerProfile?.paypal_email) {
      try {
        const result = await sendPayPalPayout(
          sellerProfile.paypal_email,
          payoutAmount,
          purchaseId,
          `Payout for ${listing.domain_name}`
        );

        if (result.success) {
          payoutSuccess = true;
          payoutMethod = 'paypal';
          payoutId = result.payoutBatchId || null;

          // Record payout
          await supabase.from('payouts').insert({
            seller_id: listing.seller_id,
            amount: payoutAmount,
            status: 'completed',
            payout_method: 'paypal',
            paypal_payout_id: payoutId,
            processed_at: new Date().toISOString(),
          });
        } else {
          console.error('PayPal payout failed:', result.error);
        }
      } catch (paypalError) {
        console.error('PayPal payout error:', paypalError);
      }
    }

    // Try Stripe if preferred and configured, or as fallback
    if (!payoutSuccess && sellerProfile?.stripe_account_id) {
      if (preferredMethod === 'stripe' || !preferredMethod) {
        try {
          const transfer = await stripe.transfers.create({
            amount: payoutAmount,
            currency: 'usd',
            destination: sellerProfile.stripe_account_id,
            transfer_group: purchaseId,
            metadata: {
              purchase_id: purchaseId,
              domain_name: listing.domain_name,
            },
          });

          payoutSuccess = true;
          payoutMethod = 'stripe';
          payoutId = transfer.id;

          // Record payout
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
    }

    // Send payout email to seller
    if (seller?.user?.email && payoutSuccess) {
      sendPayoutEmail(seller.user.email, payoutAmount, listing.domain_name).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      payoutProcessed: payoutSuccess,
      payoutMethod,
    });
  } catch (error) {
    console.error('Transfer confirmation error:', error);
    return NextResponse.json({ error: 'Failed to confirm transfer' }, { status: 500 });
  }
}
