import Link from 'next/link';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Use service client to bypass RLS for admin queries
  const supabase = await createServiceClient();

  // Fetch stats
  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true });

  const { count: activeListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: pendingVerification } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_verification');

  const { count: soldListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sold');

  const { count: totalSellers, error: sellersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'seller');

  // Debug logging
  console.log('Sellers query result:', { totalSellers, sellersError });

  const { count: pendingDisputes } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .not('dispute_opened_at', 'is', null)
    .is('dispute_resolved_at', null);

  const { count: pendingTransfers } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('transfer_status', 'pending');

  // Recent activity
  const { data: recentListings } = await supabase
    .from('listings')
    .select('id, domain_name, status, created_at, seller_id')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: recentPurchases } = await supabase
    .from('purchases')
    .select('id, buyer_email, amount_paid, transfer_status, created_at, listing_id')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/domains">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <p className="text-sm text-gray-500">Total Listings</p>
              <p className="text-3xl font-bold text-gray-900">{totalListings || 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/domains?status=active">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-3xl font-bold text-green-600">{activeListings || 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/domains?status=pending_verification">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <p className="text-sm text-gray-500">Pending Verification</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingVerification || 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/domains?status=sold">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <p className="text-sm text-gray-500">Domains Sold</p>
              <p className="text-3xl font-bold text-blue-600">{soldListings || 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/sellers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <p className="text-sm text-gray-500">Total Sellers</p>
              <p className="text-3xl font-bold text-gray-900">{totalSellers || 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/payouts?status=pending">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <p className="text-sm text-gray-500">Pending Transfers</p>
              <p className="text-3xl font-bold text-orange-600">{pendingTransfers || 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/disputes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <p className="text-sm text-gray-500">Open Disputes</p>
              <p className="text-3xl font-bold text-red-600">{pendingDisputes || 0}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/payouts">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${((soldListings || 0) * 99).toLocaleString()}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alerts */}
      {(pendingDisputes || 0) > 0 && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="danger">Action Required</Badge>
              <p className="text-sm text-red-800">
                {pendingDisputes} open dispute{pendingDisputes !== 1 ? 's' : ''} require attention
              </p>
            </div>
            <Link href="/admin/disputes" className="text-sm text-red-600 hover:underline">
              View Disputes
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Listings</CardTitle>
              <Link href="/admin/domains" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentListings && recentListings.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentListings.map((listing: any) => (
                  <div key={listing.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{listing.domain_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        listing.status === 'active' ? 'success' :
                        listing.status === 'sold' ? 'info' :
                        listing.status === 'pending_verification' ? 'warning' : 'default'
                      }
                    >
                      {listing.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No listings yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Purchases</CardTitle>
              <Link href="/admin/payouts" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPurchases && recentPurchases.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentPurchases.map((purchase: any) => (
                  <div key={purchase.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{purchase.buyer_email}</p>
                      <p className="text-xs text-gray-500">
                        ${(purchase.amount_paid / 100).toFixed(2)} &middot; {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        purchase.transfer_status === 'completed' ? 'success' :
                        purchase.transfer_status === 'pending' ? 'warning' :
                        purchase.transfer_status === 'disputed' ? 'danger' : 'default'
                      }
                    >
                      {purchase.transfer_status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No purchases yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
