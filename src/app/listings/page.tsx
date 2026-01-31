import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ListingFilters, RemoveListingButton } from '@/components/domain';
import type { Listing } from '@/types/database';

export const dynamic = 'force-dynamic';

interface ListingsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const { status: statusFilter } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: listingsData } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  const listingsRaw = (listingsData || []) as Listing[];

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
  const sortedListings = [...listingsRaw].sort((a, b) =>
    (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99)
  );

  // Filter based on URL param
  const listings = statusFilter && statusFilter !== 'all'
    ? sortedListings.filter(l => l.status === statusFilter)
    : sortedListings;

  // Counts for filter tabs
  const filterCounts = {
    all: listingsRaw.length,
    pending_payment: listingsRaw.filter(l => l.status === 'pending_payment').length,
    pending_verification: listingsRaw.filter(l => l.status === 'pending_verification').length,
    active: listingsRaw.filter(l => l.status === 'active').length,
    sold: listingsRaw.filter(l => l.status === 'sold').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'sold':
        return 'info';
      case 'pending_verification':
        return 'warning';
      case 'pending_payment':
        return 'danger';
      case 'paused':
        return 'default';
      case 'expired':
      case 'removed':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-500 mt-1">Manage all your domain listings</p>
        </div>
        <Link href="/submit">
          <Button>Submit Domains</Button>
        </Link>
      </div>

      <ListingFilters counts={filterCounts} basePath="/listings" />

      {listings.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {statusFilter ? `No ${statusFilter.replace(/_/g, ' ')} listings` : 'No domains listed yet'}
              </p>
              <Link href="/submit">
                <Button>Submit Your Domains</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card padding="none">
          <div className="divide-y divide-gray-200">
            {listings.map((listing) => (
              <div key={listing.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">{listing.domain_name}</p>
                    <Badge variant="default" size="sm">.{listing.tld}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {listing.listed_at && (
                      <span>Listed {new Date(listing.listed_at).toLocaleDateString()}</span>
                    )}
                    {listing.ai_tier && (
                      <Badge
                        variant={listing.ai_tier === 'high' ? 'success' : listing.ai_tier === 'medium' ? 'info' : 'default'}
                        size="sm"
                      >
                        {listing.ai_tier === 'high' ? 'High Interest' : listing.ai_tier === 'medium' ? 'Medium' : 'Standard'}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getStatusColor(listing.status) as any}>
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

                  {listing.status === 'active' && (
                    <Link href={`/domain/${listing.domain_name}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  )}

                  {listing.status !== 'sold' && listing.status !== 'removed' && (
                    <RemoveListingButton listingId={listing.id} domainName={listing.domain_name} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
