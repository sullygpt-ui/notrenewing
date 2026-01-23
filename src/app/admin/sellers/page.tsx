import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, Badge } from '@/components/ui';
import { AdminSellerActions } from './actions';

export const dynamic = 'force-dynamic';

interface SellersPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function AdminSellersPage({ searchParams }: SellersPageProps) {
  const { role } = await searchParams;
  // Use service client to bypass RLS for admin queries
  const supabase = await createServiceClient();

  // Fetch all users
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Filter by role if specified
  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  const { data: profiles, error } = await query;

  if (error) {
    console.error('Error fetching profiles:', error);
  }

  // Get listing counts for each seller
  const sellerIds = profiles?.map(p => p.id) || [];

  const { data: listingCounts } = sellerIds.length > 0
    ? await supabase
        .from('listings')
        .select('seller_id, status')
        .in('seller_id', sellerIds)
    : { data: [] };

  // Calculate stats per seller
  const sellerStats: Record<string, { total: number; active: number; sold: number }> = {};
  listingCounts?.forEach((listing: any) => {
    if (!sellerStats[listing.seller_id]) {
      sellerStats[listing.seller_id] = { total: 0, active: 0, sold: 0 };
    }
    sellerStats[listing.seller_id].total++;
    if (listing.status === 'active') sellerStats[listing.seller_id].active++;
    if (listing.status === 'sold') sellerStats[listing.seller_id].sold++;
  });

  // Get user emails from auth
  const sellersWithEmails = await Promise.all(
    (profiles || []).map(async (profile: any) => {
      const { data } = await supabase.auth.admin.getUserById(profile.id);
      return {
        ...profile,
        email: data?.user?.email || 'Unknown',
        stats: sellerStats[profile.id] || { total: 0, active: 0, sold: 0 },
      };
    })
  );

  const roleFilters = [
    { label: 'All Users', value: 'all' },
    { label: 'Sellers', value: 'seller' },
    { label: 'Admins', value: 'admin' },
  ];

  const currentRole = role || 'all';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <span className="text-sm text-gray-500">{profiles?.length || 0} users found</span>
      </div>

      {/* Role Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {roleFilters.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === 'all' ? '/admin/sellers' : `/admin/sellers?role=${filter.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentRole === filter.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reliability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sellersWithEmails && sellersWithEmails.length > 0 ? (
                sellersWithEmails.map((seller: any) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{seller.email}</p>
                        <p className="text-xs text-gray-500">{seller.id.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={seller.role === 'admin' ? 'info' : 'default'}>
                        {seller.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {seller.stats.total}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600">
                      {seller.stats.active}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {seller.stats.sold}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              seller.reliability_score >= 80 ? 'bg-green-500' :
                              seller.reliability_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${seller.reliability_score}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{seller.reliability_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {seller.is_suspended ? (
                        <Badge variant="danger">Suspended</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(seller.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AdminSellerActions seller={seller} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
