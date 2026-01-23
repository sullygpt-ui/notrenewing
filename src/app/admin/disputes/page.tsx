import { createServiceClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { AdminDisputeActions } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminDisputesPage() {
  // Use service client to bypass RLS for admin queries
  const supabase = await createServiceClient();

  // Fetch all disputes (purchases with dispute_opened_at set)
  const { data: disputes } = await supabase
    .from('purchases')
    .select(`
      *,
      listing:listings(
        id,
        domain_name,
        seller_id
      )
    `)
    .not('dispute_opened_at', 'is', null)
    .order('dispute_opened_at', { ascending: false });

  // Get seller emails
  const disputesWithDetails = await Promise.all(
    (disputes || []).map(async (dispute: any) => {
      const { data: sellerData } = await supabase.auth.admin.getUserById(
        dispute.listing?.seller_id
      );
      return {
        ...dispute,
        seller_email: sellerData?.user?.email || 'Unknown',
      };
    })
  );

  const openDisputes = disputesWithDetails.filter((d: any) => !d.dispute_resolved_at);
  const resolvedDisputes = disputesWithDetails.filter((d: any) => d.dispute_resolved_at);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dispute Management</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {openDisputes.length} open, {resolvedDisputes.length} resolved
          </span>
        </div>
      </div>

      {/* Open Disputes */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Open Disputes</h2>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opened</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {openDisputes.length > 0 ? (
                  openDisputes.map((dispute: any) => (
                    <tr key={dispute.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{dispute.listing?.domain_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dispute.buyer_email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dispute.seller_email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {dispute.dispute_reason || 'No reason provided'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(dispute.dispute_opened_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${(dispute.amount_paid / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <AdminDisputeActions dispute={dispute} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No open disputes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Resolved Disputes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolved Disputes</h2>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resolvedDisputes.length > 0 ? (
                  resolvedDisputes.map((dispute: any) => (
                    <tr key={dispute.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{dispute.listing?.domain_name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dispute.buyer_email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dispute.seller_email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            dispute.dispute_outcome === 'buyer_refunded' ? 'warning' :
                            dispute.dispute_outcome === 'seller_paid' ? 'success' : 'default'
                          }
                        >
                          {dispute.dispute_outcome === 'buyer_refunded' ? 'Buyer Refunded' :
                           dispute.dispute_outcome === 'seller_paid' ? 'Seller Paid' : 'Admin Decision'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(dispute.dispute_resolved_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ${(dispute.amount_paid / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No resolved disputes
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
