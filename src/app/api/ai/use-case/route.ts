import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateUseCase } from '@/lib/ai/scoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch the listing
    const { data: listingData, error: listingError } = await supabase
      .from('listings')
      .select('id, domain_name, seller_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listingData) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listingData as { id: string; domain_name: string; seller_id: string };

    // Generate the use-case
    const useCase = await generateUseCase(listing.domain_name);

    if (!useCase) {
      return NextResponse.json({ error: 'Failed to generate use-case' }, { status: 500 });
    }

    // Update the listing with the use-case
    const { error: updateError } = await supabase
      .from('listings')
      .update({ use_case: useCase } as any)
      .eq('id', listingId);

    if (updateError) {
      console.error('Failed to update listing use-case:', updateError);
      return NextResponse.json({ error: 'Failed to save use-case' }, { status: 500 });
    }

    return NextResponse.json({ useCase });
  } catch (error) {
    console.error('Use-case generation error:', error);
    return NextResponse.json({ error: 'Failed to generate use-case' }, { status: 500 });
  }
}

// PATCH endpoint for seller to edit use-case
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, useCase } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    // Validate use-case length (max 80 chars)
    if (useCase && useCase.length > 80) {
      return NextResponse.json({ error: 'Use-case must be 80 characters or less' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user owns this listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this listing' }, { status: 403 });
    }

    // Update the use-case
    const { error: updateError } = await supabase
      .from('listings')
      .update({ use_case: useCase || null } as any)
      .eq('id', listingId);

    if (updateError) {
      console.error('Failed to update use-case:', updateError);
      return NextResponse.json({ error: 'Failed to save use-case' }, { status: 500 });
    }

    return NextResponse.json({ success: true, useCase });
  } catch (error) {
    console.error('Use-case update error:', error);
    return NextResponse.json({ error: 'Failed to update use-case' }, { status: 500 });
  }
}
