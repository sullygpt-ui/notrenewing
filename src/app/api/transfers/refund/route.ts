import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purchaseId, reason } = body;

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get purchase info
    const { data: purchase, error: purchaseError } = await serviceClient
      .from('purchases')
      .select('*, listings(*)')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.transfer_status === 'completed') {
      return NextResponse.json({ error: 'Cannot refund a completed transfer' }, { status: 400 });
    }

    if (!purchase.stripe_payment_intent_id) {
      return NextResponse.json({ error: 'No payment intent found' }, { status: 400 });
    }

    // Process refund via Stripe
    try {
      await stripe.refunds.create({
        payment_intent: purchase.stripe_payment_intent_id,
        reason: 'requested_by_customer',
      });
    } catch (stripeError: any) {
      console.error('Stripe refund error:', stripeError);
      return NextResponse.json({ error: stripeError.message || 'Refund failed' }, { status: 500 });
    }

    // Update purchase and listing status
    const listing = purchase.listings as any;

    await serviceClient
      .from('purchases')
      .update({
        transfer_status: 'failed',
        dispute_resolved_at: new Date().toISOString(),
        dispute_outcome: 'buyer_refunded',
        dispute_reason: reason || 'Refund processed by admin',
      })
      .eq('id', purchaseId);

    // Re-activate the listing so it can be sold again
    await serviceClient
      .from('listings')
      .update({
        status: 'active',
      })
      .eq('id', listing.id);

    return NextResponse.json({ success: true, message: 'Refund processed successfully' });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
