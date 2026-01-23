import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTOTPSecret, generateQRCode, generateBackupCodes, hashBackupCode } from '@/lib/auth/two-factor';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if 2FA is already enabled
    const { data: userData } = await supabase
      .from('profiles')
      .select('totp_enabled')
      .eq('id', user.id)
      .single();

    if (userData?.totp_enabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
    }

    // Generate new TOTP secret
    const secret = generateTOTPSecret();
    const qrCode = await generateQRCode(secret, user.email || '');

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Store the secret temporarily (not enabled yet)
    await supabase
      .from('profiles')
      .update({ totp_secret: secret })
      .eq('id', user.id);

    // Store hashed backup codes
    const backupCodeRecords = backupCodes.map(code => ({
      user_id: user.id,
      code_hash: hashBackupCode(code),
    }));

    // Delete any existing backup codes
    await supabase
      .from('backup_codes')
      .delete()
      .eq('user_id', user.id);

    // Insert new backup codes
    await supabase
      .from('backup_codes')
      .insert(backupCodeRecords);

    return NextResponse.json({
      secret,
      qrCode,
      backupCodes: backupCodes.map(code => `${code.slice(0, 4)}-${code.slice(4)}`),
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 });
  }
}
