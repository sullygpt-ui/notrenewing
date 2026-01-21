import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DomainGrid } from '@/components/domain';
import { Button, Badge } from '@/components/ui';
import type { Listing } from '@/types/database';

export const dynamic = 'force-dynamic';

const SUPPORTED_TLDS = ['com', 'net', 'org', 'io', 'ai'];

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch top AI-scored domains for leaderboard
  const { data: leaderboardData } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('admin_hidden', false)
    .order('ai_score', { ascending: false })
    .limit(12);

  // Fetch sponsored domains
  const { data: sponsoredData } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('is_sponsored', true)
    .eq('admin_hidden', false)
    .limit(4);

  // Fetch recently listed domains
  const { data: recentData } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('admin_hidden', false)
    .order('listed_at', { ascending: false })
    .limit(8);

  const leaderboardDomains = (leaderboardData || []) as Listing[];
  const sponsoredDomains = (sponsoredData || []) as Listing[];
  const recentDomains = (recentData || []) as Listing[];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Domains You Won&apos;t Renew.
            <br />
            <span className="text-primary-600">Buyers Who Will.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            The marketplace for domain portfolio cleanup. Every domain is $99.
            No negotiation. No speculation. Just quick, certain liquidation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg">Browse Domains</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Leaderboard Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Top Picks</h2>
              <p className="text-gray-500 mt-1">AI-curated domains with high buyer interest</p>
            </div>
            <Link href="/browse">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <DomainGrid listings={leaderboardDomains || []} />
        </div>
      </section>

      {/* Sponsored Section */}
      {sponsoredDomains && sponsoredDomains.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-xl font-bold text-gray-900">Sponsored</h2>
              <Badge variant="warning">Ad</Badge>
            </div>
            <DomainGrid listings={sponsoredDomains} showTier={false} />
          </div>
        </section>
      )}

      {/* Recently Listed Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recently Listed</h2>
              <p className="text-gray-500 mt-1">Fresh domains just added to the marketplace</p>
            </div>
            <Link href="/browse?sort=newest">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          <DomainGrid listings={recentDomains || []} />
        </div>
      </section>

      {/* Browse by TLD Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Extension</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SUPPORTED_TLDS.map((tld) => (
              <Link
                key={tld}
                href={`/browse?tld=${tld}`}
                className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:border-primary-300 hover:shadow-md transition-all"
              >
                <span className="text-2xl font-bold text-gray-900">.{tld}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sellers List
              </h3>
              <p className="text-gray-600">
                Domain owners list domains they don&apos;t plan to renew. $1 per listing. Verification required.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Buyers Browse
              </h3>
              <p className="text-gray-600">
                Find domains at a fixed $99 price. No negotiation. No hidden fees. AI helps surface the best picks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transfer Complete
              </h3>
              <p className="text-gray-600">
                We hold payment until transfer is confirmed. Seller gets paid. Buyer gets the domain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Got domains you&apos;re not renewing?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Turn your expiring domains into cash. List for $1, sell for $99.
          </p>
          <Link href="/signup">
            <Button variant="secondary" size="lg">
              Start Selling Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
