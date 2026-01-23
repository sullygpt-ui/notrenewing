import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingIds } = body as { listingIds: string[] };

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json({ error: 'No listing IDs provided' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify listings belong to user and are pending payment
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, domain_name')
      .in('id', listingIds)
      .eq('seller_id', user.id)
      .eq('status', 'pending_payment');

    if (listingsError || !listings || listings.length === 0) {
      return NextResponse.json({ error: 'No valid listings found' }, { status: 400 });
    }

    const domainCount = listings.length;
    const amount = domainCount * 100; // $1 per domain in cents

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Domain Listing Fee',
              description: `Listing fee for ${domainCount} domain${domainCount > 1 ? 's' : ''}`,
            },
            unit_amount: 100, // $1 per domain
          },
          quantity: domainCount,
        },
      ],
      metadata: {
        type: 'listing_fee',
        seller_id: user.id,
        listing_ids: JSON.stringify(listingIds),
        domain_count: domainCount.toString(),
      },
      customer_email: user.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&count=${domainCount}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Listing fee checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
