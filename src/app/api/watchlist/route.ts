import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/watchlist - Get user's watchlist
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('watchlist')
    .select(`
      id,
      created_at,
      listing:listings (
        id,
        domain_name,
        tld,
        expiration_date,
        ai_score,
        ai_tier,
        status,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ watchlist: data });
}

// POST /api/watchlist - Add to watchlist
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { listingId } = await request.json();
  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      user_id: user.id,
      listing_id: listingId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already in watchlist' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, watchlistItem: data });
}

// DELETE /api/watchlist - Remove from watchlist
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { listingId } = await request.json();
  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
