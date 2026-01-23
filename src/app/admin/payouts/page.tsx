import { createServiceClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { AdminPayoutActions } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPayoutsPage() {
  // Use service client to bypass RLS for admin queries
  const supabase = await createServiceClient();

  // Fetch all payouts
  const { data: payouts } = await supabase
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false });

  // Get seller emails
  const payoutsWithDetails = await Promise.all(
    (payouts || []).map(async (payout: any) => {
      const { data: sellerData } = await supabase.auth.admin.getUserById(payout.seller_id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('payout_method, paypal_email, stripe_account_id')
        .eq('id', payout.seller_id)
        .single();
      return {
        ...payout,
        seller_email: sellerData?.user?.email || 'Unknown',
        payout_method: profile?.payout_method || 'Not set',
        paypal_email: profile?.paypal_email,
        stripe_account_id: profile?.stripe_account_id,
      };
    })
  );

  const pendingPayouts = payoutsWithDetails.filter((p: any) => p.status === 'pending');
  const processingPayouts = payoutsWithDetails.filter((p: any) => p.status === 'processing');
  const completedPayouts = payoutsWithDetails.filter((p: any) => p.status === 'completed');
  const failedPayouts = payoutsWithDetails.filter((p: any) => p.status === 'failed');

  // Calculate totals
  const totalPending = pendingPayouts.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalCompleted = completedPayouts.reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Payout Management</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-orange-600">${(totalPending / 100).toFixed(2)}</p>
          <p className="text-xs text-gray-400">{pendingPayouts.length} payouts</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{processingPayouts.length}</p>
          <p className="text-xs text-gray-400">payouts in progress</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">${(totalCompleted / 100).toFixed(2)}</p>
          <p className="text-xs text-gray-400">{completedPayouts.length} payouts</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-600">{failedPayouts.length}</p>
          <p className="text-xs text-gray-400">needs attention</p>
        </Card>
      </div>

      {/* Pending Payouts */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Payouts</h2>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingPayouts.length > 0 ? (
                  pendingPayouts.map((payout: any) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{payout.seller_email}</p>
                        <p className="text-xs text-gray-500">{payout.seller_id.slice(0, 8)}...</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${(payout.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payout.payout_method === 'stripe' ? (
                          <span>Stripe {payout.stripe_account_id ? '(Connected)' : '(Not connected)'}</span>
                        ) : payout.payout_method === 'paypal' ? (
                          <span>PayPal: {payout.paypal_email}</span>
                        ) : (
                          <span className="text-orange-600">Not configured</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <AdminPayoutActions payout={payout} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No pending payouts
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recent Payouts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payouts</h2>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...completedPayouts, ...failedPayouts].slice(0, 20).length > 0 ? (
                  [...completedPayouts, ...failedPayouts].slice(0, 20).map((payout: any) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{payout.seller_email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${(payout.amount / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payout.payout_method || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={payout.status === 'completed' ? 'success' : 'danger'}>
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {payout.processed_at
                          ? new Date(payout.processed_at).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No recent payouts
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
