import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payoutId, action } = body;

    if (!payoutId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['process', 'complete', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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

    // Get the payout
    const { data: payout } = await serviceClient
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .single();

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    let updateData: Record<string, any> = {};

    switch (action) {
      case 'process':
        if (payout.status !== 'pending') {
          return NextResponse.json({ error: 'Can only process pending payouts' }, { status: 400 });
        }
        updateData = { status: 'processing' };
        // TODO: Trigger actual Stripe Connect transfer here
        break;

      case 'complete':
        updateData = {
          status: 'completed',
          processed_at: new Date().toISOString(),
        };
        break;

      case 'cancel':
        if (payout.status === 'completed') {
          return NextResponse.json({ error: 'Cannot cancel completed payouts' }, { status: 400 });
        }
        updateData = { status: 'failed' };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await serviceClient
      .from('payouts')
      .update(updateData)
      .eq('id', payoutId);

    if (error) {
      console.error('Failed to update payout:', error);
      return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin payout error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}

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

    // Get pending payouts stats
    const { data: pendingPayouts } = await serviceClient
      .from('payouts')
      .select('amount')
      .eq('status', 'pending');

    const totalPending = (pendingPayouts || []).reduce((sum, p) => sum + p.amount, 0);
    const countPending = (pendingPayouts || []).length;

    return NextResponse.json({
      pendingCount: countPending,
      pendingAmount: totalPending,
    });
  } catch (error) {
    console.error('Admin payouts error:', error);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}
