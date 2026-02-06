import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/likes?listingId=xxx - Check if user has liked a domain
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  // Get total like count
  const { data: listing } = await supabase
    .from('listings')
    .select('like_count')
    .eq('id', listingId)
    .single();

  // Check if logged-in user has liked this domain
  let hasLiked = false;
  
  if (user) {
    const { data } = await supabase
      .from('domain_likes')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user_id', user.id)
      .single();
    hasLiked = !!data;
  }

  return NextResponse.json({ 
    hasLiked, 
    likeCount: listing?.like_count || 0 
  });
}

// POST /api/likes - Like a domain (requires login)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { listingId } = await request.json();

  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
  }

  // Require authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Login required to like domains' }, { status: 401 });
  }

  // Insert like
  const { data, error } = await supabase
    .from('domain_likes')
    .insert({
      listing_id: listingId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 });
    }
    console.error('Failed to create like:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get updated like count
  const { data: listing } = await supabase
    .from('listings')
    .select('like_count')
    .eq('id', listingId)
    .single();

  return NextResponse.json({ 
    success: true, 
    like: data,
    likeCount: listing?.like_count || 0
  });
}

// DELETE /api/likes - Unlike a domain (requires login)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { listingId } = await request.json();

  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
  }

  // Require authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const { error } = await supabase
    .from('domain_likes')
    .delete()
    .eq('listing_id', listingId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to delete like:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get updated like count
  const { data: listing } = await supabase
    .from('listings')
    .select('like_count')
    .eq('id', listingId)
    .single();

  return NextResponse.json({ 
    success: true,
    likeCount: listing?.like_count || 0
  });
}
