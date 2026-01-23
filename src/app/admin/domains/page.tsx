import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { AdminDomainActions } from './actions';

export const dynamic = 'force-dynamic';

interface DomainsPageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function AdminDomainsPage({ searchParams }: DomainsPageProps) {
  const { status, search } = await searchParams;
  // Use service client to bypass RLS for admin queries
  const supabase = await createServiceClient();

  let query = supabase
    .from('listings')
    .select('*, profiles!inner(id)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('domain_name', `%${search}%`);
  }

  const { data: listings } = await query.limit(100);

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending Verification', value: 'pending_verification' },
    { label: 'Pending Payment', value: 'pending_payment' },
    { label: 'Sold', value: 'sold' },
    { label: 'Paused', value: 'paused' },
    { label: 'Hidden', value: 'hidden' },
  ];

  const currentStatus = status || 'all';

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Domain Management</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === 'all' ? '/admin/domains' : `/admin/domains?status=${filter.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStatus === filter.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mb-6">
        <input
          type="text"
          name="search"
          placeholder="Search domains..."
          defaultValue={search}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </form>

      {/* Listings Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AI Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hidden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listings && listings.length > 0 ? (
                listings.map((listing: any) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/domains/${listing.id}`} className="block">
                        <p className="font-medium text-gray-900 hover:text-primary-600">{listing.domain_name}</p>
                        <p className="text-xs text-gray-500">.{listing.tld}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          listing.status === 'active' ? 'success' :
                          listing.status === 'sold' ? 'info' :
                          listing.status === 'pending_verification' ? 'warning' :
                          listing.status === 'pending_payment' ? 'danger' : 'default'
                        }
                      >
                        {listing.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {listing.ai_score !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{listing.ai_score}</span>
                          <Badge
                            variant={
                              listing.ai_tier === 'high' ? 'success' :
                              listing.ai_tier === 'medium' ? 'info' : 'default'
                            }
                            size="sm"
                          >
                            {listing.ai_tier}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {listing.admin_featured ? (
                        <Badge variant="success" size="sm">Yes</Badge>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {listing.admin_hidden ? (
                        <Badge variant="danger" size="sm">Hidden</Badge>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AdminDomainActions listing={listing} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No domains found
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
