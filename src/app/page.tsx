import Link from 'next/link';
import { Shield, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DomainGrid, HeroSearch } from '@/components/domain';
import { Button, Badge, NewsletterForm, SocialProof, DomainAlertsForm } from '@/components/ui';
import type { Listing } from '@/types/database';

export const dynamic = 'force-dynamic';

// TLD colors for the filter buttons
const TLD_STYLES: Record<string, string> = {
  com: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300',
  net: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300',
  org: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
  io: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300',
  ai: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 hover:border-pink-300',
};

const SUPPORTED_TLDS = ['com', 'net', 'org', 'io', 'ai'];

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch stats for social proof
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { count: soldThisWeek } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('transfer_status', 'completed')
    .gte('created_at', oneWeekAgo.toISOString());

  const { count: activeListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .eq('admin_hidden', false);

  const { count: totalSold } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('transfer_status', 'completed');

  // Fetch top AI-scored domains for leaderboard
  const { data: leaderboardData } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('admin_hidden', false)
    .eq('is_sponsored', false)
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
  
  // Check if we have any domains to show
  const hasLeaderboardDomains = leaderboardDomains.length > 0;
  const hasRecentDomains = recentDomains.length > 0;
  const hasSponsoredDomains = sponsoredDomains.length > 0;
  const hasAnyDomains = hasLeaderboardDomains || hasRecentDomains;

  return (
    <div>
      {/* Free Listing Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-400 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-bold text-gray-900">
            🎉 Now in Beta: Enjoy Free Listings of up to 25 Domains!
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 py-12 md:py-16 overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Domains You Won&apos;t Renew.{' '}
            <span className="text-primary-200">Buyers Who Will.</span>
          </h1>
          <p className="text-primary-100 text-lg mb-8">
            Every domain is <span className="font-bold text-white">$99</span>. No negotiation. No hassle.
          </p>
          <HeroSearch />
          
          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-primary-200">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Secure transfers via Stripe</span>
            </div>
            <span className="hidden sm:inline text-primary-400">•</span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>AI-powered domain scoring</span>
            </div>
            <span className="hidden sm:inline text-primary-400">•</span>
            <div className="flex items-center gap-1.5">
              <span>From the creators of</span>
              <Link href="https://sullysblog.com" className="font-semibold text-white hover:underline">
                SullysBlog.com
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-gray-50 py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SocialProof 
            soldThisWeek={soldThisWeek || 0} 
            activeListings={activeListings || 0} 
            totalSold={totalSold || 0} 
          />
        </div>
      </section>

      {/* Domain Alerts Signup - Show prominently when inventory is low */}
      {!hasAnyDomains && (
        <section className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <DomainAlertsForm />
          </div>
        </section>
      )}

      {/* AI Leaderboard Section - Only show if we have domains */}
      {hasLeaderboardDomains && (
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
                <p className="text-gray-500 mt-1">Domains with High Buyer Interest</p>
              </div>
              <Link href="/browse">
                <Button variant="ghost">View All</Button>
              </Link>
            </div>
            <DomainGrid listings={leaderboardDomains} />
          </div>
        </section>
      )}

      {/* Sponsored Section */}
      {hasSponsoredDomains && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-xl font-bold text-gray-900">Sponsored</h2>
              <Badge variant="warning">Ad</Badge>
            </div>
            <DomainGrid listings={sponsoredDomains} />
          </div>
        </section>
      )}

      {/* Recently Listed Section - Only show if we have domains */}
      {hasRecentDomains && (
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
            <DomainGrid listings={recentDomains} />
          </div>
        </section>
      )}

      {/* Browse by TLD Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Extension</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SUPPORTED_TLDS.map((tld) => (
              <Link
                key={tld}
                href={`/browse?tld=${tld}`}
                className={`rounded-xl border-2 p-6 text-center transition-all ${TLD_STYLES[tld]}`}
              >
                <span className="text-2xl font-bold">.{tld}</span>
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
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sellers List
              </h3>
              <p className="text-gray-600">
                Domain owners list domains they don&apos;t plan to renew. <span className="font-semibold text-green-600">Free to list</span>. We take $2 from the sale.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
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
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
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

      {/* Domain Alerts Signup - Show here too if we have domains (secondary placement) */}
      {hasAnyDomains && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <DomainAlertsForm />
          </div>
        </section>
      )}

      {/* Newsletter Section - Keep the original one for general updates */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Stay Updated
          </h2>
          <NewsletterForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Got domains you&apos;re not renewing?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Turn your expiring domains into cash. <span className="font-semibold text-yellow-300">Free to list</span>, sell for $99.
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
