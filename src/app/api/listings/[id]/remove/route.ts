import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the listing and verify ownership
  const { data: listing, error: fetchError } = await supabase
    .from('listings')
    .select('id, seller_id, status, domain_name')
    .eq('id', id)
    .single();

  if (fetchError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  // Verify the user owns this listing
  if (listing.seller_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized to remove this listing' }, { status: 403 });
  }

  // Can only remove listings that aren't sold
  if (listing.status === 'sold') {
    return NextResponse.json({ error: 'Cannot remove a sold listing' }, { status: 400 });
  }

  // Update status to removed
  const { error: updateError } = await supabase
    .from('listings')
    .update({ status: 'removed' })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to remove listing:', updateError);
    return NextResponse.json({ error: 'Failed to remove listing' }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    message: `${listing.domain_name} has been removed` 
  });
}
