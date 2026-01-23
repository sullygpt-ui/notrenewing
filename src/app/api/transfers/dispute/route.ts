import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purchaseId, reason } = body;

    if (!purchaseId || !reason) {
      return NextResponse.json({ error: 'Purchase ID and reason are required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Get purchase info
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.transfer_status === 'completed') {
      return NextResponse.json({ error: 'Cannot dispute a completed transfer' }, { status: 400 });
    }

    if (purchase.transfer_status === 'disputed') {
      return NextResponse.json({ error: 'Dispute already opened' }, { status: 400 });
    }

    // Update purchase with dispute
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        transfer_status: 'disputed',
        dispute_reason: reason,
        dispute_opened_at: new Date().toISOString(),
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('Failed to open dispute:', updateError);
      return NextResponse.json({ error: 'Failed to open dispute' }, { status: 500 });
    }

    // TODO: Send notification emails to admin and seller

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Dispute error:', error);
    return NextResponse.json({ error: 'Failed to open dispute' }, { status: 500 });
  }
}
