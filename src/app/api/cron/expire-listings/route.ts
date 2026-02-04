import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // Find all active listings past their expiration date
    const { data: expiredListings, error: fetchError } = await supabase
      .from('listings')
      .select('id, domain_name, seller_id, expires_at')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString());

    if (fetchError) {
      console.error('Failed to fetch expired listings:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }

    if (!expiredListings || expiredListings.length === 0) {
      return NextResponse.json({ message: 'No expired listings to process', processed: 0 });
    }

    // Update all expired listings to 'expired' status
    const listingIds = expiredListings.map(l => l.id);
    
    const { error: updateError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .in('id', listingIds);

    if (updateError) {
      console.error('Failed to update expired listings:', updateError);
      return NextResponse.json({ error: 'Failed to update listings' }, { status: 500 });
    }

    console.log(`Expired ${expiredListings.length} listings:`, expiredListings.map(l => l.domain_name));

    return NextResponse.json({
      message: `Expired ${expiredListings.length} listings`,
      processed: expiredListings.length,
      domains: expiredListings.map(l => l.domain_name),
    });
  } catch (error) {
    console.error('Expire listings cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
