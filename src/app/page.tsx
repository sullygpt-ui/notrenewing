import Link from 'next/link';
import { Shield, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DomainGrid, HeroSearch } from '@/components/domain';
import { Button, Badge, SocialProof, DomainAlertsForm, Testimonials, PaymentBadges } from '@/components/ui';
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
            Now in Beta: Enjoy Free Listings of up to 25 Domains!
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-[#0a0a1a] py-12 md:py-16 overflow-hidden">
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.4] mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-600/30 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute top-1/4 -right-32 w-80 h-80 bg-blue-500/25 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_1s]" />
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[150px] animate-[pulse_12s_ease-in-out_infinite_2s]" />
          
          {/* Floating accent dots */}
          <div className="absolute top-12 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-[bounce_3s_ease-in-out_infinite] shadow-lg shadow-yellow-400/50" />
          <div className="absolute bottom-16 left-16 w-1.5 h-1.5 bg-teal-400 rounded-full animate-[bounce_4s_ease-in-out_infinite_0.5s] shadow-lg shadow-teal-400/50" />
          <div className="absolute top-1/3 left-20 w-1.5 h-1.5 bg-purple-400 rounded-full animate-[bounce_3.5s_ease-in-out_infinite_1s] shadow-lg shadow-purple-400/50" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0V0zm1 1v58h58V1H1z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-[0.95]">
            Domains You Won&apos;t Renew.
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]">
              Buyers Who Will.
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg mb-8 max-w-2xl mx-auto font-light">
            Every domain is <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10">$99</span>. No negotiation. No hassle.
          </p>
          
          {/* Glassmorphism search wrapper */}
          <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-2xl shadow-black/20">
            <HeroSearch />
          </div>
          
          {/* Glassmorphism trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 text-xs md:text-sm">
            <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Secure transfers</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>AI-powered scoring</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <span>From</span>
              <Link href="https://sullysblog.com" className="font-semibold text-white hover:text-yellow-300 transition-colors">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Browse by Extension</h2>
          <p className="text-gray-500 mb-8">Find domains by your preferred TLD</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SUPPORTED_TLDS.map((tld) => (
              <Link
                key={tld}
                href={`/browse?tld=${tld}`}
                className={`rounded-xl border-2 p-6 text-center transition-all hover:scale-105 hover:shadow-lg ${TLD_STYLES[tld]}`}
              >
                <span className="text-2xl font-bold">.{tld}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Three simple steps to buy or sell domains at a fixed price
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sellers List
              </h3>
              <p className="text-gray-600">
                Domain owners list domains they don&apos;t plan to renew. <span className="font-semibold text-green-600">Free to list</span>. We take $2 from the sale.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Buyers Browse
              </h3>
              <p className="text-gray-600">
                Find domains at a fixed $99 price. No negotiation. No hidden fees. AI helps surface the best picks.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Transfer Complete
              </h3>
              <p className="text-gray-600">
                We hold payment until transfer is confirmed. Seller gets paid. Buyer gets the domain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Domain Alerts Signup - Show here too if we have domains (secondary placement) */}
      {hasAnyDomains && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <DomainAlertsForm />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative bg-[#0a0a1a] py-14 md:py-16 overflow-hidden">
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.4] mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/25 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/20 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-[150px] animate-[pulse_8s_ease-in-out_infinite]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Got domains you&apos;re not renewing?
          </h2>
          <p className="text-gray-400 text-base md:text-lg mb-6 max-w-xl mx-auto">
            Turn your expiring domains into cash. <span className="font-semibold text-yellow-300">Free to list</span>, sell for $99.
          </p>
          <Link href="/signup">
            <Button variant="secondary" size="lg" className="shadow-xl shadow-black/20 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Start Selling Today
            </Button>
          </Link>
          <div className="mt-6">
            <PaymentBadges className="[&>div]:bg-white/5 [&>div]:border [&>div]:border-white/10 [&>div]:text-gray-400" />
          </div>
        </div>
      </section>
    </div>
  );
}
