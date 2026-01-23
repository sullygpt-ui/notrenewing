import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { scoreDomain } from '@/lib/ai/scoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, domainName } = body;

    if (!listingId || !domainName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Score the domain
    const scoreResult = await scoreDomain(domainName);

    // Update the listing (ai_reasoning column may not exist yet)
    const updateData: Record<string, any> = {
      ai_score: scoreResult.score,
      ai_tier: scoreResult.tier,
      ai_scored_at: new Date().toISOString(),
    };

    // Use service client to bypass RLS
    const { error } = await serviceClient
      .from('listings')
      .update(updateData)
      .eq('id', listingId);

    if (error) {
      console.error('Failed to update listing:', error);
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      score: scoreResult.score,
      tier: scoreResult.tier,
      reasoning: scoreResult.reasoning,
    });
  } catch (error) {
    console.error('Rescore error:', error);
    return NextResponse.json({ error: 'Rescore failed' }, { status: 500 });
  }
}
