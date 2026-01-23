import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ListingFilters } from '@/components/domain';
import { StripeConnectCard } from '@/components/dashboard';
import type { Listing, Purchase } from '@/types/database';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { status: statusFilter } = await searchParams;
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
  const pendingPayment = listings.filter(l => l.status === 'pending_payment');
  const pendingVerification = listings.filter(l => l.status === 'pending_verification');
  const soldListings = listings.filter(l => l.status === 'sold');
  const pendingTransfers = purchases.filter(p => p.transfer_status === 'pending');

  // Sort listings: pending first (payment, then verification), then active, then others
  const statusPriority: Record<string, number> = {
    pending_payment: 0,
    pending_verification: 1,
    active: 2,
    sold: 3,
    paused: 4,
    expired: 5,
    removed: 6,
  };
  const sortedListings = [...listings].sort((a, b) =>
    (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99)
  );

  // Filter listings based on URL param
  const filteredListings = statusFilter && statusFilter !== 'all'
    ? sortedListings.filter(l => l.status === statusFilter)
    : sortedListings;

  const totalEarnings = soldListings.length * 9583; // $95.83 per sale in cents

  const filterCounts = {
    all: listings.length,
    pending_payment: pendingPayment.length,
    pending_verification: pendingVerification.length,
    active: activeListings.length,
    sold: soldListings.length,
  };

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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Active Listings</p>
            <p className="text-3xl font-bold text-gray-900">{activeListings.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Pending Payment</p>
            <p className="text-3xl font-bold text-orange-600">{pendingPayment.length}</p>
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

      {/* Stripe Connect */}
      <div className="mb-8">
        <StripeConnectCard />
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

      {/* Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingFilters counts={filterCounts} />

          {filteredListings && filteredListings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredListings.map((listing) => (
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
                          : listing.status === 'pending_payment'
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {listing.status.replace(/_/g, ' ')}
                    </Badge>
                    {listing.status === 'pending_payment' && (
                      <Link href={`/listings/${listing.id}/pay`}>
                        <Button variant="outline" size="sm">Pay Now</Button>
                      </Link>
                    )}
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
