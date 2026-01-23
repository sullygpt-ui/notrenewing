import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyBackupCode, parseBackupCode } from '@/lib/auth/two-factor';

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Backup code is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get all unused backup codes for the user
    const { data: backupCodes } = await supabase
      .from('backup_codes')
      .select('id, code_hash')
      .eq('user_id', userId)
      .is('used_at', null);

    if (!backupCodes || backupCodes.length === 0) {
      return NextResponse.json({ error: 'No valid backup codes available' }, { status: 400 });
    }

    // Parse and verify the code
    const parsedCode = parseBackupCode(code);

    for (const backupCode of backupCodes) {
      if (verifyBackupCode(parsedCode, backupCode.code_hash)) {
        // Mark the code as used
        await supabase
          .from('backup_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('id', backupCode.id);

        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'Invalid backup code' }, { status: 400 });
  } catch (error) {
    console.error('Backup code verify error:', error);
    return NextResponse.json({ error: 'Failed to verify backup code' }, { status: 500 });
  }
}
