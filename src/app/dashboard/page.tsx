import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ThumbsUp, Pencil, Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ListingFilters } from '@/components/domain';
import { PayoutSettings, UseCaseEditor, WatchlistDomainsList } from '@/components/dashboard';
import type { Listing, Purchase, DomainLike } from '@/types/database';

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

  // Create a map of listing ID to purchase for quick lookup
  const purchaseByListingId = new Map(purchases.map(p => [p.listing_id, p]));

  // Fetch user's watchlist (saved/hearted domains)
  const { data: watchlistData } = await supabase
    .from('watchlist')
    .select(`
      id,
      listing_id,
      created_at,
      listing:listings!inner (
        id,
        domain_name,
        tld,
        status,
        ai_tier,
        category,
        expiration_date
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const watchlistDomains = (watchlistData || []).map((item: any) => ({
    watchlistId: item.id,
    createdAt: item.created_at,
    ...item.listing
  }));

  const activeListings = listings.filter(l => l.status === 'active');
  const pendingPayment = listings.filter(l => l.status === 'pending_payment');
  const pendingVerification = listings.filter(l => l.status === 'pending_verification');
  const soldListings = listings.filter(l => l.status === 'sold');

  // Pending transfers that need seller action (no transfer info yet)
  const pendingTransfers = purchases.filter(p =>
    p.transfer_status === 'pending' && !p.transfer_initiated_at
  );
  // Transfers awaiting buyer confirmation
  const awaitingBuyerConfirmation = purchases.filter(p =>
    p.transfer_status === 'pending' && p.transfer_initiated_at
  );

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
        <Link href="/dashboard?status=active">
          <Card className={`cursor-pointer hover:border-primary-300 hover:shadow-md transition-all ${statusFilter === 'active' ? 'border-primary-500 ring-2 ring-primary-200' : ''}`}>
            <CardContent>
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-3xl font-bold text-gray-900">{activeListings.length}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard?status=pending_payment">
          <Card className={`cursor-pointer hover:border-primary-300 hover:shadow-md transition-all ${statusFilter === 'pending_payment' ? 'border-primary-500 ring-2 ring-primary-200' : ''}`}>
            <CardContent>
              <p className="text-sm text-gray-500">Pending Payment</p>
              <p className="text-3xl font-bold text-orange-600">{pendingPayment.length}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard?status=pending_verification">
          <Card className={`cursor-pointer hover:border-primary-300 hover:shadow-md transition-all ${statusFilter === 'pending_verification' ? 'border-primary-500 ring-2 ring-primary-200' : ''}`}>
            <CardContent>
              <p className="text-sm text-gray-500">Pending Verification</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingVerification.length}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard?status=sold">
          <Card className={`cursor-pointer hover:border-primary-300 hover:shadow-md transition-all ${statusFilter === 'sold' ? 'border-primary-500 ring-2 ring-primary-200' : ''}`}>
            <CardContent>
              <p className="text-sm text-gray-500">Domains Sold</p>
              <p className="text-3xl font-bold text-green-600">{soldListings.length}</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900">${(totalEarnings / 100).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Settings */}
      <div className="mb-8">
        <PayoutSettings />
      </div>

      {/* Saved Domains (Watchlist) */}
      {watchlistDomains.length > 0 && (
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
                Saved Domains ({watchlistDomains.length})
              </CardTitle>
              <Link href="/browse">
                <Button size="sm" variant="outline">Browse More</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <WatchlistDomainsList domains={watchlistDomains} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Transfers Alert */}
      {pendingTransfers.length > 0 && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="warning">Action Required</Badge>
              <p className="text-sm text-yellow-800">
                You have {pendingTransfers.length} domain{pendingTransfers.length !== 1 ? 's' : ''} that need transfer info.
                Submit auth codes within 72 hours.
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {pendingTransfers.map(purchase => {
              const listing = listings.find(l => l.id === purchase.listing_id);
              return (
                <div key={purchase.id} className="flex items-center justify-between bg-white p-2 rounded border border-yellow-200">
                  <span className="font-medium text-gray-900">{listing?.domain_name}</span>
                  <Link href={`/dashboard/transfers/${purchase.id}`}>
                    <Button size="sm" variant="outline">Submit Transfer Info</Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Awaiting Buyer Confirmation */}
      {awaitingBuyerConfirmation.length > 0 && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="info">Awaiting Confirmation</Badge>
            <p className="text-sm text-blue-800">
              {awaitingBuyerConfirmation.length} transfer{awaitingBuyerConfirmation.length !== 1 ? 's' : ''} awaiting buyer confirmation.
              Payment will auto-release after 7 days.
            </p>
          </div>
          <div className="space-y-2">
            {awaitingBuyerConfirmation.map(purchase => {
              const listing = listings.find(l => l.id === purchase.listing_id);
              const deadline = purchase.buyer_confirmation_deadline ? new Date(purchase.buyer_confirmation_deadline) : null;
              return (
                <div key={purchase.id} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                  <div>
                    <span className="font-medium text-gray-900">{listing?.domain_name}</span>
                    {deadline && (
                      <span className="ml-2 text-xs text-blue-600">
                        Auto-release: {deadline.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <Link href={`/dashboard/transfers/${purchase.id}`}>
                    <Button size="sm" variant="ghost">View</Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Listings</CardTitle>
          <Link href="/submit">
            <Button size="sm">+ Submit Domains</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <ListingFilters counts={filterCounts} />

          {filteredListings && filteredListings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredListings.map((listing) => {
                // Calculate expiration display
                const getExpirationDisplay = () => {
                  if (!listing.expiration_date) return null;
                  const expDate = new Date(listing.expiration_date);
                  const now = new Date();
                  const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  if (daysUntil <= 30) return { text: `${daysUntil}d`, urgent: true };
                  if (daysUntil <= 90) return { text: `${Math.ceil(daysUntil / 30)}mo`, urgent: false };
                  return { text: expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), urgent: false };
                };
                const expDisplay = getExpirationDisplay();
                
                // Domain age display
                const getAgeDisplay = () => {
                  if (!listing.domain_age_months) return null;
                  if (listing.domain_age_months < 12) return `${listing.domain_age_months}mo`;
                  const years = Math.floor(listing.domain_age_months / 12);
                  return `${years}yr${years > 1 ? 's' : ''}`;
                };
                const ageDisplay = getAgeDisplay();
                
                return (
                <div key={listing.id} className="py-4 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{listing.domain_name}</p>
                    {/* Use-case editor - only show for active listings */}
                    {(listing.status === 'active' || listing.status === 'pending_verification') && (
                      <div className="mt-1">
                        <UseCaseEditor 
                          listingId={listing.id} 
                          domainName={listing.domain_name}
                          initialUseCase={listing.use_case} 
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                      {listing.listed_at && (
                        <span>Listed {new Date(listing.listed_at).toLocaleDateString()}</span>
                      )}
                      {ageDisplay && (
                        <span className="inline-flex items-center gap-1">
                          <span className="text-gray-400">Age:</span> {ageDisplay}
                        </span>
                      )}
                      {expDisplay && (
                        <span className={`inline-flex items-center gap-1 ${expDisplay.urgent ? 'text-orange-600 font-medium' : ''}`}>
                          <span className="text-gray-400">Exp:</span> {expDisplay.text}
                        </span>
                      )}
                      {listing.registrar && (
                        <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                          <span className="text-gray-400">Reg:</span> 
                          <span className="truncate">{listing.registrar}</span>
                        </span>
                      )}
                      {(listing.like_count ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-primary-600 font-medium">
                          <ThumbsUp className="w-3 h-3" />
                          {listing.like_count} {listing.like_count === 1 ? 'like' : 'likes'}
                        </span>
                      )}
                    </div>
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
                    {(listing.status === 'active' || listing.status === 'pending_verification' || listing.status === 'pending_payment') && (
                      <Link href={`/dashboard/listings/${listing.id}/edit`}>
                        <Button variant="ghost" size="sm" title="Edit listing">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    {listing.status === 'sold' && purchaseByListingId.get(listing.id) && (
                      <Link href={`/dashboard/transfers/${purchaseByListingId.get(listing.id)!.id}`}>
                        <Button variant="outline" size="sm">
                          {purchaseByListingId.get(listing.id)!.transfer_initiated_at
                            ? 'View Transfer'
                            : 'Transfer'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
              })}
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
