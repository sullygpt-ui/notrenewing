import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { generateUseCase } from '@/lib/ai/scoring';

// GET - Check status of listings without use-cases
export async function GET(request: NextRequest) {
  try {
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

    // Count listings without use-cases
    const { count, error } = await serviceClient
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .is('use_case', null)
      .in('status', ['active', 'pending_verification', 'pending_payment']);

    if (error) {
      return NextResponse.json({ error: 'Failed to count listings' }, { status: 500 });
    }

    return NextResponse.json({ 
      pendingCount: count || 0,
      message: count ? `${count} listings need use-cases` : 'All listings have use-cases'
    });
  } catch (error) {
    console.error('Backfill status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

// POST - Run the backfill (processes in batches)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 20; // Default to 20 at a time

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

    // Fetch listings without use-cases
    const { data: listings, error } = await serviceClient
      .from('listings')
      .select('id, domain_name')
      .is('use_case', null)
      .in('status', ['active', 'pending_verification', 'pending_payment'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    if (!listings || listings.length === 0) {
      return NextResponse.json({ 
        success: true, 
        processed: 0,
        message: 'All listings already have use-cases'
      });
    }

    let successCount = 0;
    let failCount = 0;
    const results: { domain: string; useCase?: string; error?: string }[] = [];

    // Process all listings in parallel with a concurrency limit
    const concurrencyLimit = 5;
    const chunks: typeof listings[] = [];
    
    for (let i = 0; i < listings.length; i += concurrencyLimit) {
      chunks.push(listings.slice(i, i + concurrencyLimit));
    }

    for (const chunk of chunks) {
      const promises = chunk.map(async (listing) => {
        try {
          const useCase = await generateUseCase(listing.domain_name);
          
          if (useCase) {
            const { error: updateError } = await serviceClient
              .from('listings')
              .update({ use_case: useCase })
              .eq('id', listing.id);

            if (updateError) {
              failCount++;
              results.push({ domain: listing.domain_name, error: updateError.message });
            } else {
              successCount++;
              results.push({ domain: listing.domain_name, useCase });
            }
          } else {
            failCount++;
            results.push({ domain: listing.domain_name, error: 'No use-case generated' });
          }
        } catch (err) {
          failCount++;
          results.push({ domain: listing.domain_name, error: String(err) });
        }
      });

      await Promise.all(promises);
    }

    return NextResponse.json({
      success: true,
      processed: listings.length,
      successCount,
      failCount,
      results
    });
  } catch (error) {
    console.error('Backfill error:', error);
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 });
  }
}
