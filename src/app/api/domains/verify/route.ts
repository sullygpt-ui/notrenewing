import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyDomainOwnership } from '@/lib/dns/verification';
import { lookupDomain } from '@/lib/dns/rdap';
import { scoreDomain } from '@/lib/ai/scoring';
import { sendListingLiveEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/api-utils';
import type { Listing } from '@/types/database';

export async function POST(request: NextRequest) {
  // Rate limit: 20 verification attempts per minute
  const rateLimitCheck = checkRateLimit(request, 'verify', { windowMs: 60000, maxRequests: 20 });
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response;
  }

  try {
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the listing
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .eq('seller_id', user.id)
      .single();

    if (listingError || !listingData) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listingData as Listing;

    if (listing.status !== 'pending_verification') {
      return NextResponse.json(
        { error: 'Listing is not pending verification' },
        { status: 400 }
      );
    }

    if (!listing.verification_token) {
      return NextResponse.json(
        { error: 'No verification token found' },
        { status: 400 }
      );
    }

    // Verify DNS record
    const result = await verifyDomainOwnership(
      listing.domain_name,
      listing.verification_token
    );

    if (!result.verified) {
      return NextResponse.json({
        verified: false,
        error: result.error,
      });
    }

    // AI score the domain
    const score = await scoreDomain(listing.domain_name);

    // Lookup domain info (registrar, expiration, etc.)
    const domainInfo = await lookupDomain(listing.domain_name);

    // Update listing
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        status: 'active',
        verified_at: new Date().toISOString(),
        listed_at: new Date().toISOString(),
        expires_at: domainInfo.expirationDate?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Use domain expiration date, fallback to 30 days
        ai_score: score.score,
        ai_tier: score.tier,
        ai_scored_at: new Date().toISOString(),
        registrar: domainInfo.registrar,
        expiration_date: domainInfo.expirationDate?.toISOString() || null,
        domain_age_months: domainInfo.ageInMonths,
      } as any)
      .eq('id', listingId);

    if (updateError) {
      console.error('Failed to update listing:', updateError);
      return NextResponse.json({ error: 'Failed to activate listing' }, { status: 500 });
    }

    // Send listing live email (don't wait)
    sendListingLiveEmail(user.email!, listing.domain_name).catch((err) =>
      console.error('Failed to send listing live email:', err)
    );

    return NextResponse.json({
      verified: true,
      score: score.score,
      tier: score.tier,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
