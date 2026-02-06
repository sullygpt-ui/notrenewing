import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch a single listing (seller must own it)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: listing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .eq('seller_id', user.id)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Fetch listing error:', error);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

// PATCH - Update a listing (seller can edit specific fields)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user owns this listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('seller_id, status')
      .eq('id', id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this listing' }, { status: 403 });
    }

    // Only allow editing of certain fields by sellers
    const allowedFields = ['registrar', 'expiration_date', 'use_case'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (field in body) {
        // Validate expiration_date format if provided
        if (field === 'expiration_date' && body[field]) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(body[field])) {
            return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
          }
        }
        // Validate use_case length
        if (field === 'use_case' && body[field] && body[field].length > 80) {
          return NextResponse.json({ error: 'Use-case must be 80 characters or less' }, { status: 400 });
        }
        // Validate registrar length
        if (field === 'registrar' && body[field] && body[field].length > 100) {
          return NextResponse.json({ error: 'Registrar must be 100 characters or less' }, { status: 400 });
        }
        
        updateData[field] = body[field] || null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('listings')
      .update(updateData as any)
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update listing:', updateError);
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}
