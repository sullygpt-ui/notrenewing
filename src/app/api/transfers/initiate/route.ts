import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { sendTransferInitiatedEmail } from '@/lib/email';

const BUYER_CONFIRMATION_DAYS = 7;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { purchaseId, authCode, notes } = body;

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    if (!authCode || !authCode.trim()) {
      return NextResponse.json({ error: 'Auth code is required' }, { status: 400 });
    }

    // Verify the seller is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = await createServiceClient();

    // Get purchase and verify seller owns the listing
    const { data: purchase, error: purchaseError } = await serviceClient
      .from('purchases')
      .select('*, listings(*)')
      .eq('id', purchaseId)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const listing = purchase.listings as any;

    if (listing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized - not your listing' }, { status: 403 });
    }

    if (purchase.transfer_status === 'completed') {
      return NextResponse.json({ error: 'Transfer already completed' }, { status: 400 });
    }

    if (purchase.transfer_status === 'disputed') {
      return NextResponse.json({ error: 'Cannot update a disputed transfer' }, { status: 400 });
    }

    // Calculate buyer confirmation deadline (7 days from now)
    const confirmationDeadline = new Date();
    confirmationDeadline.setDate(confirmationDeadline.getDate() + BUYER_CONFIRMATION_DAYS);

    // Update purchase with transfer info
    const { error: updateError } = await serviceClient
      .from('purchases')
      .update({
        transfer_initiated_at: new Date().toISOString(),
        auth_code: authCode.trim(),
        transfer_notes: notes?.trim() || null,
        buyer_confirmation_deadline: confirmationDeadline.toISOString(),
      })
      .eq('id', purchaseId);

    if (updateError) {
      console.error('Failed to update purchase:', updateError);
      return NextResponse.json({ error: 'Failed to initiate transfer' }, { status: 500 });
    }

    // Send email to buyer with transfer info
    sendTransferInitiatedEmail(
      purchase.buyer_email,
      listing.domain_name,
      authCode.trim(),
      notes?.trim() || null,
      confirmationDeadline,
      purchaseId
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      buyerConfirmationDeadline: confirmationDeadline.toISOString(),
    });
  } catch (error) {
    console.error('Transfer initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate transfer' }, { status: 500 });
  }
}
