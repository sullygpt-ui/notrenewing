import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyTOTP } from '@/lib/auth/two-factor';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's TOTP secret
    const { data: userData } = await supabase
      .from('profiles')
      .select('totp_secret, totp_enabled')
      .eq('id', user.id)
      .single();

    if (!userData?.totp_secret) {
      return NextResponse.json({ error: '2FA not set up' }, { status: 400 });
    }

    // Verify the token
    const isValid = verifyTOTP(token.replace(/\s/g, ''), userData.totp_secret);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // If not already enabled, enable 2FA
    if (!userData.totp_enabled) {
      await supabase
        .from('profiles')
        .update({
          totp_enabled: true,
          totp_verified_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ error: 'Failed to verify token' }, { status: 500 });
  }
}
