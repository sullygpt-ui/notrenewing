import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scoreDomain } from '@/lib/ai/scoring';

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
      .select('id, domain_name')
      .eq('id', listingId)
      .single();

    if (listingError || !listingData) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listingData as { id: string; domain_name: string };

    // Score the domain
    const score = await scoreDomain(listing.domain_name);

    // Update the listing with the score
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        ai_score: score.score,
        ai_tier: score.tier,
        ai_scored_at: new Date().toISOString(),
      } as any)
      .eq('id', listingId);

    if (updateError) {
      console.error('Failed to update listing score:', updateError);
      return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
    }

    return NextResponse.json({
      score: score.score,
      tier: score.tier,
      reasoning: score.reasoning,
    });
  } catch (error) {
    console.error('Scoring error:', error);
    return NextResponse.json({ error: 'Failed to score domain' }, { status: 500 });
  }
}
