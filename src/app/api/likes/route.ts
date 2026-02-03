import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Generate a session ID for anonymous users
function getOrCreateSessionId(): string {
  const cookieStore = cookies();
  const existingSession = cookieStore.get('like_session_id');
  if (existingSession) {
    return existingSession.value;
  }
  return crypto.randomUUID();
}

// Hash IP for privacy-preserving rate limiting
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.LIKE_SALT || 'default-salt').digest('hex').slice(0, 16);
}

// GET /api/likes?listingId=xxx - Check if user has liked a domain
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if user (or session) has liked this domain
  let hasLiked = false;
  
  if (user) {
    const { data } = await supabase
      .from('domain_likes')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user_id', user.id)
      .single();
    hasLiked = !!data;
  } else {
    const sessionId = getOrCreateSessionId();
    const { data } = await supabase
      .from('domain_likes')
      .select('id')
      .eq('listing_id', listingId)
      .eq('session_id', sessionId)
      .single();
    hasLiked = !!data;
  }

  // Get total like count
  const { data: listing } = await supabase
    .from('listings')
    .select('like_count')
    .eq('id', listingId)
    .single();

  return NextResponse.json({ 
    hasLiked, 
    likeCount: listing?.like_count || 0 
  });
}

// POST /api/likes - Like a domain
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { listingId } = await request.json();

  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = getOrCreateSessionId();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const ipHash = hashIP(ip);

  // Insert like
  const likeData: {
    listing_id: string;
    user_id?: string;
    session_id?: string;
    ip_hash: string;
  } = {
    listing_id: listingId,
    ip_hash: ipHash,
  };

  if (user) {
    likeData.user_id = user.id;
  } else {
    likeData.session_id = sessionId;
  }

  const { data, error } = await supabase
    .from('domain_likes')
    .insert(likeData)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get updated like count
  const { data: listing } = await supabase
    .from('listings')
    .select('like_count')
    .eq('id', listingId)
    .single();

  const response = NextResponse.json({ 
    success: true, 
    like: data,
    likeCount: listing?.like_count || 0
  });

  // Set session cookie for anonymous users
  if (!user) {
    response.cookies.set('like_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return response;
}

// DELETE /api/likes - Unlike a domain
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { listingId } = await request.json();

  if (!listingId) {
    return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();

  let error;
  
  if (user) {
    ({ error } = await supabase
      .from('domain_likes')
      .delete()
      .eq('listing_id', listingId)
      .eq('user_id', user.id));
  } else {
    const sessionId = getOrCreateSessionId();
    ({ error } = await supabase
      .from('domain_likes')
      .delete()
      .eq('listing_id', listingId)
      .eq('session_id', sessionId));
  }

  if (error) {
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
