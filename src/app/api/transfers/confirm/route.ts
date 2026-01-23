import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendTransferCompleteEmail, sendPayoutEmail } from '@/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
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

    // Get seller info
    const { data: seller } = await supabase.auth.admin.getUserById(listing.seller_id);
    const { data: sellerProfile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', listing.seller_id)
      .single();

    // Send confirmation email to buyer
    sendTransferCompleteEmail(purchase.buyer_email, listing.domain_name).catch(console.error);

    // Process payout to seller if they have Stripe connected
    const payoutAmount = purchase.seller_payout || (purchase.amount_paid - (purchase.processing_fee || 0));
    let payoutSuccess = false;

    if (sellerProfile?.stripe_account_id) {
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

        // Record payout
        await supabase.from('payouts').insert({
          seller_id: listing.seller_id,
          amount: payoutAmount,
          status: 'completed',
          payout_method: 'stripe',
          stripe_transfer_id: transfer.id,
          processed_at: new Date().toISOString(),
        });

        payoutSuccess = true;
      } catch (stripeError) {
        console.error('Stripe payout error:', stripeError);
        // Don't fail the confirmation, just log the error
        // Admin can manually process payout later
      }
    }

    // Send payout email to seller
    if (seller?.user?.email) {
      const payoutAmountDollars = payoutAmount / 100;
      sendPayoutEmail(seller.user.email, listing.domain_name, payoutAmountDollars).catch(console.error);
    }

    return NextResponse.json({ success: true, payoutProcessed: payoutSuccess });
  } catch (error) {
    console.error('Transfer confirmation error:', error);
    return NextResponse.json({ error: 'Failed to confirm transfer' }, { status: 500 });
  }
}
