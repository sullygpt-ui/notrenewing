import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendTransferCompleteEmail, sendPayoutEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purchaseId } = body;

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Get purchase and listing info
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*, listings(*)')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    if (purchase.transfer_status === 'completed') {
      return NextResponse.json({ error: 'Transfer already confirmed' }, { status: 400 });
    }

    if (purchase.transfer_status === 'disputed') {
      return NextResponse.json({ error: 'Cannot confirm a disputed transfer' }, { status: 400 });
    }

    const listing = purchase.listings as any;

    // Update purchase status
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        transfer_status: 'completed',
        transfer_confirmed_at: new Date().toISOString(),
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('Failed to update purchase:', updateError);
      return NextResponse.json({ error: 'Failed to confirm transfer' }, { status: 500 });
    }

    // Get seller info for payout email
    const { data: seller } = await supabase.auth.admin.getUserById(listing.seller_id);

    // Send confirmation emails
    sendTransferCompleteEmail(purchase.buyer_email, listing.domain_name).catch(console.error);

    if (seller?.user?.email) {
      const payoutAmount = (purchase.amount_paid - (purchase.processing_fee || 0)) / 100;
      sendPayoutEmail(seller.user.email, listing.domain_name, payoutAmount).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transfer confirmation error:', error);
    return NextResponse.json({ error: 'Failed to confirm transfer' }, { status: 500 });
  }
}
