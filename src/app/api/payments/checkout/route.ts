import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe';
import type { Listing } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, buyerEmail } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    if (!buyerEmail || !buyerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Fetch the listing
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .eq('status', 'active')
      .single();

    if (listingError || !listingData) {
      return NextResponse.json({ error: 'Listing not found or unavailable' }, { status: 404 });
    }

    const listing = listingData as Listing;

    // Create Stripe checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await createCheckoutSession({
      listingId: listing.id,
      domainName: listing.domain_name,
      buyerEmail,
      successUrl: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/domain/${listing.domain_name}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
