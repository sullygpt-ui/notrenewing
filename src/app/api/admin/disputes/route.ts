import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purchaseId, outcome } = body;

    if (!purchaseId || !outcome) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['buyer_refunded', 'seller_paid', 'admin_decision'].includes(outcome)) {
      return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 });
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

    // Get the purchase
    const { data: purchase } = await serviceClient
      .from('purchases')
      .select('*, listing:listings(seller_id)')
      .eq('id', purchaseId)
      .single();

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (!purchase.dispute_opened_at) {
      return NextResponse.json({ error: 'No dispute open for this purchase' }, { status: 400 });
    }

    if (purchase.dispute_resolved_at) {
      return NextResponse.json({ error: 'Dispute already resolved' }, { status: 400 });
    }

    // Update the purchase with resolution
    const { error: updateError } = await serviceClient
      .from('purchases')
      .update({
        dispute_outcome: outcome,
        dispute_resolved_at: new Date().toISOString(),
        transfer_status: outcome === 'buyer_refunded' ? 'failed' : 'completed',
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('Failed to update purchase:', updateError);
      return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 });
    }

    // Process refund via Stripe if buyer_refunded
    if (outcome === 'buyer_refunded' && purchase.stripe_payment_intent_id) {
      try {
        await stripe.refunds.create({
          payment_intent: purchase.stripe_payment_intent_id,
          reason: 'requested_by_customer',
        });
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        // Revert the database update
        await serviceClient
          .from('purchases')
          .update({
            dispute_outcome: null,
            dispute_resolved_at: null,
            transfer_status: 'disputed',
          })
          .eq('id', purchaseId);
        return NextResponse.json({ error: 'Stripe refund failed: ' + stripeError.message }, { status: 500 });
      }

      // Reduce seller reliability score
      if (purchase.listing?.seller_id) {
        const { data: sellerProfile } = await serviceClient
          .from('profiles')
          .select('reliability_score')
          .eq('id', purchase.listing.seller_id)
          .single();

        if (sellerProfile) {
          const newScore = Math.max(0, (sellerProfile.reliability_score || 100) - 10);
          await serviceClient
            .from('profiles')
            .update({ reliability_score: newScore })
            .eq('id', purchase.listing.seller_id);
        }
      }

      // Re-activate the listing so it can be sold again
      if (purchase.listing_id) {
        await serviceClient
          .from('listings')
          .update({ status: 'active' })
          .eq('id', purchase.listing_id);
      }
    }

    // If seller_paid, update listing to sold status
    if (outcome === 'seller_paid' && purchase.listing_id) {
      await serviceClient
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', purchase.listing_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin dispute error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
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

    // Get open disputes count
    const { count } = await serviceClient
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .not('dispute_opened_at', 'is', null)
      .is('dispute_resolved_at', null);

    return NextResponse.json({ openDisputes: count || 0 });
  } catch (error) {
    console.error('Admin disputes error:', error);
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  }
}
