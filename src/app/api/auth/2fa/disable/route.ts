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
      .from('users')
      .select('totp_secret, totp_enabled')
      .eq('id', user.id)
      .single();

    if (!userData?.totp_enabled || !userData?.totp_secret) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    // Verify the token
    const isValid = verifyTOTP(token.replace(/\s/g, ''), userData.totp_secret);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // Disable 2FA
    await supabase
      .from('users')
      .update({
        totp_secret: null,
        totp_enabled: false,
        totp_verified_at: null,
      })
      .eq('id', user.id);

    // Delete backup codes
    await supabase
      .from('backup_codes')
      .delete()
      .eq('user_id', user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}
