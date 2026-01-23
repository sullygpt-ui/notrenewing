import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// Process payout to seller (called when transfer is confirmed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purchaseId } = body;

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    const serviceClient = await createServiceClient();

    // Get purchase with listing and seller info
    const { data: purchase, error: purchaseError } = await serviceClient
      .from('purchases')
      .select('*, listings(*)')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.transfer_status !== 'completed') {
      return NextResponse.json({ error: 'Transfer not completed' }, { status: 400 });
    }

    const listing = purchase.listings as any;

    // Get seller's Stripe account
    const { data: sellerProfile } = await serviceClient
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', listing.seller_id)
      .single();

    if (!sellerProfile?.stripe_account_id) {
      return NextResponse.json({ error: 'Seller has not connected Stripe' }, { status: 400 });
    }

    // Check if payout already exists
    const { data: existingPayout } = await serviceClient
      .from('payouts')
      .select('id')
      .eq('seller_id', listing.seller_id)
      .eq('stripe_transfer_id', purchaseId)
      .single();

    if (existingPayout) {
      return NextResponse.json({ error: 'Payout already processed' }, { status: 400 });
    }

    // Calculate payout amount (total - processing fee)
    const payoutAmount = purchase.seller_payout || (purchase.amount_paid - (purchase.processing_fee || 0));

    // Create transfer to seller's Stripe account
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

    // Record payout in database
    await serviceClient.from('payouts').insert({
      seller_id: listing.seller_id,
      amount: payoutAmount,
      status: 'completed',
      payout_method: 'stripe',
      stripe_transfer_id: transfer.id,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: payoutAmount,
    });
  } catch (error: any) {
    console.error('Payout error:', error);
    return NextResponse.json({ error: error.message || 'Payout failed' }, { status: 500 });
  }
}
