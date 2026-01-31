import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/api-utils';
import { sendVerificationEmail } from '@/lib/email';

interface DomainSubmission {
  domain: string;
  tld: string;
}

const MAX_ACTIVE_LISTINGS_PER_USER = 25;

export async function POST(request: NextRequest) {
  // Rate limit: 5 submissions per hour
  const rateLimitCheck = checkRateLimit(request, 'submit', { windowMs: 3600000, maxRequests: 5 });
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response;
  }

  try {
    const body = await request.json();
    const { domains } = body as { domains: DomainSubmission[] };

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json({ error: 'No domains provided' }, { status: 400 });
    }

    if (domains.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 domains per submission' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check active listing limit per user
    const { count: activeListingCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .in('status', ['active', 'pending_verification', 'pending_payment']);

    const currentActiveCount = activeListingCount || 0;
    const availableSlots = MAX_ACTIVE_LISTINGS_PER_USER - currentActiveCount;

    if (availableSlots <= 0) {
      return NextResponse.json({
        error: `You have reached the maximum of ${MAX_ACTIVE_LISTINGS_PER_USER} active listings. Please wait for some to sell or expire before listing more.`
      }, { status: 400 });
    }

    if (domains.length > availableSlots) {
      return NextResponse.json({
        error: `You can only list ${availableSlots} more domain${availableSlots === 1 ? '' : 's'}. You currently have ${currentActiveCount} active listing${currentActiveCount === 1 ? '' : 's'}.`
      }, { status: 400 });
    }

    // Create listings - always free, go directly to pending_verification
    const listings = domains.map((d) => ({
      seller_id: user.id,
      domain_name: d.domain,
      tld: d.tld,
      status: 'pending_verification' as const,
      verification_token: crypto.randomUUID().split('-')[0].toUpperCase(),
    }));

    const { data: createdListings, error: insertError } = await supabase
      .from('listings')
      .insert(listings as any)
      .select();

    if (insertError) {
      console.error('Failed to create listings:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Send verification emails for each domain
    if (createdListings && user.email) {
      for (const listing of createdListings) {
        try {
          const result = await sendVerificationEmail(
            user.email,
            listing.domain_name,
            listing.verification_token,
            listing.id
          );
          console.log(`Email sent for ${listing.domain_name}:`, result);
        } catch (err) {
          console.error(`Failed to send verification email for ${listing.domain_name}:`, err);
        }
      }
    }

    // Return listing IDs - listings are free
    return NextResponse.json({
      success: true,
      count: createdListings?.length || 0,
      listingIds: (createdListings || []).map((l: any) => l.id),
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to submit domains' }, { status: 500 });
  }
}
