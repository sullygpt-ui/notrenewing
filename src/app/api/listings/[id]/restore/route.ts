import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('id, seller_id, status, domain_name, verified_at')
    .eq('id', id)
    .single();

  if (fetchError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  if (listing.seller_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  if (listing.status !== 'removed') {
    return NextResponse.json({ error: 'Listing is not removed' }, { status: 400 });
  }

  // Restore to appropriate status based on verification
  const newStatus = listing.verified_at ? 'active' : 'pending_verification';

  const { error: updateError } = await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to restore listing' }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    message: `${listing.domain_name} has been restored`,
    newStatus
  });
}
