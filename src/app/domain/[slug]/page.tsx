import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button, Badge, Card, CardContent, ShareButtons } from '@/components/ui';
import { WatchlistButton } from '@/components/domain';
import type { Listing } from '@/types/database';

export const dynamic = 'force-dynamic';

interface DomainPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: listingData } = await supabase
    .from('listings')
    .select('*')
    .eq('domain_name', slug)
    .eq('status', 'active')
    .eq('admin_hidden', false)
    .single();

  if (!listingData) {
    notFound();
  }

  const listing = listingData as Listing;

  // Check if user has this in their watchlist
  const { data: { user } } = await supabase.auth.getUser();
  let isWatched = false;
  if (user) {
    const { data: watchlistItem } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .single();
    isWatched = !!watchlistItem;
  }

  const tierLabels: Record<string, string> = {
    high: 'High Interest',
    medium: 'Medium Interest',
    low: 'Standard',
  };

  const formatExpirationDate = (date: string | null) => {
    if (!date) return 'Unknown';
    const expDate = new Date(date);
    return expDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDomainAge = (months: number | null) => {
    if (!months) return 'Unknown';
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/browse" className="text-sm text-primary-600 hover:underline">
          &larr; Back to browse
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="default">.{listing.tld}</Badge>
              {listing.ai_tier && (
                <Badge
                  variant={
                    listing.ai_tier === 'high'
                      ? 'success'
                      : listing.ai_tier === 'medium'
                      ? 'info'
                      : 'default'
                  }
                >
                  {tierLabels[listing.ai_tier]}
                </Badge>
              )}
              {listing.is_sponsored && <Badge variant="warning">Sponsored</Badge>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 break-all">
              {listing.domain_name}
            </h1>
            <div className="mt-3 flex items-center gap-4">
              <ShareButtons 
                domain={listing.domain_name} 
                url={`https://notrenewing.com/domain/${listing.domain_name}`} 
              />
              <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                <span className="text-sm text-gray-500">Save:</span>
                <WatchlistButton listingId={listing.id} isWatched={isWatched} />
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Domain Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Extension</dt>
                  <dd className="text-gray-900 font-medium">.{listing.tld}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Registrar</dt>
                  <dd className="text-gray-900 font-medium">{listing.registrar || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Domain Age</dt>
                  <dd className="text-gray-900 font-medium">{formatDomainAge(listing.domain_age_months)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Expires</dt>
                  <dd className="text-gray-900 font-medium">{formatExpirationDate(listing.expiration_date)}</dd>
                </div>
                {listing.category && (
                  <div>
                    <dt className="text-sm text-gray-500">Category</dt>
                    <dd className="text-gray-900 font-medium capitalize">{listing.category.replace('-', ' ')}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">How Transfer Works</h2>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <span>Complete your purchase. Payment is held securely by the platform.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <span>The seller initiates the domain transfer within 72 hours.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <span>Accept the transfer at your registrar (you'll receive instructions).</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                  <span>Confirm receipt. Seller receives payment. Done!</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Card */}
        <div>
          <Card className="sticky top-24">
            <CardContent>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-gray-900">$99</span>
                <p className="text-sm text-gray-500 mt-1">Fixed price. No negotiation.</p>
              </div>

              <Link href={`/checkout/${listing.id}`}>
                <Button className="w-full" size="lg">
                  Buy Now
                </Button>
              </Link>

              <div className="mt-6 space-y-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Secure payment via Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Payment held until transfer confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Full refund if transfer fails</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
