import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { TwoFactorSetup } from '@/components/auth/two-factor-setup';
import { TwoFactorStatus } from '@/components/auth/two-factor-status';

export const dynamic = 'force-dynamic';

export default async function SecuritySettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('totp_enabled, totp_verified_at')
    .eq('id', user.id)
    .single();

  const is2FAEnabled = userData?.totp_enabled || false;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account security</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          {is2FAEnabled ? (
            <TwoFactorStatus enabledAt={userData?.totp_verified_at} />
          ) : (
            <TwoFactorSetup />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
