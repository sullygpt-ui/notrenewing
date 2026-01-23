import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - fetch current payout settings
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('payout_method, paypal_email, stripe_account_id')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      payout_method: profile?.payout_method || null,
      paypal_email: profile?.paypal_email || null,
      stripe_connected: !!profile?.stripe_account_id,
    });
  } catch (error) {
    console.error('Error fetching payout settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - update payout settings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { payout_method, paypal_email } = body;

    // Validate payout method
    if (!['stripe', 'paypal'].includes(payout_method)) {
      return NextResponse.json({ error: 'Invalid payout method' }, { status: 400 });
    }

    // If PayPal, require email
    if (payout_method === 'paypal') {
      if (!paypal_email || !paypal_email.includes('@')) {
        return NextResponse.json({ error: 'Valid PayPal email required' }, { status: 400 });
      }
    }

    // If Stripe, check that they have Stripe connected
    if (payout_method === 'stripe') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', user.id)
        .single();

      if (!profile?.stripe_account_id) {
        return NextResponse.json({ error: 'Connect Stripe account first' }, { status: 400 });
      }
    }

    // Update profile
    const updateData: Record<string, string | null> = {
      payout_method,
    };

    if (payout_method === 'paypal') {
      updateData.paypal_email = paypal_email;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating payout settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating payout settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
