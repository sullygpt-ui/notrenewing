import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface DomainSubmission {
  domain: string;
  tld: string;
}

export async function POST(request: NextRequest) {
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

    // Create listings with pending_payment status (emails sent after payment)
    const listings = domains.map((d) => ({
      seller_id: user.id,
      domain_name: d.domain,
      tld: d.tld,
      status: 'pending_payment' as const,
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

    // Return listing IDs for payment - emails will be sent after payment succeeds
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
