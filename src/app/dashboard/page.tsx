import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import type { Listing, Purchase } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch seller stats
  const { data: listingsData } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', user.id);

  const listings = (listingsData || []) as Listing[];

  // Fetch purchases for seller's listings
  const listingIds = listings.map(l => l.id);
  const { data: purchasesData } = listingIds.length > 0
    ? await supabase
        .from('purchases')
        .select('*')
        .in('listing_id', listingIds)
    : { data: [] };

  const purchases = (purchasesData || []) as Purchase[];

  const activeListings = listings.filter(l => l.status === 'active');
  const pendingVerification = listings.filter(l => l.status === 'pending_verification');
  const soldListings = listings.filter(l => l.status === 'sold');
  const pendingTransfers = purchases.filter(p => p.transfer_status === 'pending');

  const totalEarnings = soldListings.length * 9583; // $95.83 per sale in cents

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your domain listings</p>
        </div>
        <Link href="/submit">
          <Button>Submit Domains</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Active Listings</p>
            <p className="text-3xl font-bold text-gray-900">{activeListings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Pending Verification</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingVerification.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Domains Sold</p>
            <p className="text-3xl font-bold text-green-600">{soldListings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">${(totalEarnings / 100).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Transfers Alert */}
      {pendingTransfers.length > 0 && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="warning">Action Required</Badge>
            <p className="text-sm text-yellow-800">
              You have {pendingTransfers.length} pending transfer{pendingTransfers.length !== 1 ? 's' : ''}.
              Please complete domain transfers within 72 hours.
            </p>
          </div>
        </div>
      )}

      {/* Recent Listings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Listings</CardTitle>
            <Link href="/listings">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {listings && listings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {listings.slice(0, 10).map((listing) => (
                <div key={listing.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{listing.domain_name}</p>
                    <p className="text-sm text-gray-500">
                      Listed {listing.listed_at ? new Date(listing.listed_at).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        listing.status === 'active'
                          ? 'success'
                          : listing.status === 'sold'
                          ? 'info'
                          : listing.status === 'pending_verification'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {listing.status.replace('_', ' ')}
                    </Badge>
                    {listing.status === 'pending_verification' && (
                      <Link href={`/listings/${listing.id}/verify`}>
                        <Button variant="outline" size="sm">Verify</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No domains listed yet</p>
              <Link href="/submit">
                <Button>Submit Your First Domain</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
