import Link from 'next/link';
import { Shield, Zap, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DomainGrid, HeroSearch } from '@/components/domain';
import { Button, Badge, SocialProof, DomainAlertsForm, Testimonials, PaymentBadges } from '@/components/ui';
import type { Listing } from '@/types/database';

export const dynamic = 'force-dynamic';

// TLD colors for the filter buttons - refined palette
const TLD_STYLES: Record<string, string> = {
  com: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10',
  net: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10',
  org: 'bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/10',
  io: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10',
  ai: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 hover:bg-fuchsia-100 hover:border-fuchsia-300 hover:shadow-md hover:shadow-fuchsia-500/10',
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
    <div className="bg-gray-50">
      {/* Free Listing Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-base font-semibold text-amber-900">
            🎉 Now in Beta: <span className="font-bold">Free Listings</span> of up to 25 Domains!
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#0c0a1d] via-[#0f0d24] to-[#13102b] py-16 md:py-24 overflow-hidden">
        {/* Refined noise texture */}
        <div 
          className="absolute inset-0 opacity-30 mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Animated gradient orbs - more refined */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite]" />
          <div className="absolute top-1/4 -right-48 w-[500px] h-[500px] bg-violet-500/15 rounded-full blur-[150px] animate-[pulse_12s_ease-in-out_infinite_1s]" />
          <div className="absolute -bottom-32 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[180px] animate-[pulse_14s_ease-in-out_infinite_2s]" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0V0zm1 1v58h58V1H1z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Domains You Won&apos;t Renew.
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
              Buyers Who Will.
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Every domain is{' '}
            <span className="font-semibold text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10">
              $99
            </span>
            {' '}— no negotiation, no hassle.
          </p>
          
          {/* Glassmorphism search wrapper */}
          <div className="max-w-xl mx-auto bg-white/[0.08] backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/30 ring-1 ring-white/5">
            <HeroSearch />
          </div>
          
          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10 text-sm">
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Secure transfers</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI-powered scoring</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.06] backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <span>From</span>
              <Link href="https://sullysblog.com" className="font-semibold text-white hover:text-amber-300 transition-colors">
                SullysBlog.com
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-white py-5 border-b border-gray-200/60 shadow-sm">
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
        <section className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <DomainAlertsForm />
          </div>
        </section>
      )}

      {/* AI Leaderboard Section - Only show if we have domains */}
      {hasLeaderboardDomains && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Leaderboard</h2>
                <p className="text-gray-500 mt-2">Domains with the highest buyer interest</p>
              </div>
              <Link href="/browse">
                <Button variant="ghost" className="group">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
            <DomainGrid listings={leaderboardDomains} />
          </div>
        </section>
      )}

      {/* Sponsored Section */}
      {hasSponsoredDomains && (
        <section className="py-16 bg-white border-y border-gray-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-10">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sponsored</h2>
              <Badge variant="warning">Ad</Badge>
            </div>
            <DomainGrid listings={sponsoredDomains} />
          </div>
        </section>
      )}

      {/* Recently Listed Section - Only show if we have domains */}
      {hasRecentDomains && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Recently Listed</h2>
                <p className="text-gray-500 mt-2">Fresh domains just added to the marketplace</p>
              </div>
              <Link href="/browse?sort=newest">
                <Button variant="ghost" className="group">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
            <DomainGrid listings={recentDomains} />
          </div>
        </section>
      )}

      {/* Browse by TLD Section */}
      <section className="py-16 bg-white border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Browse by Extension</h2>
          <p className="text-gray-500 mb-10">Find domains by your preferred TLD</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {SUPPORTED_TLDS.map((tld) => (
              <Link
                key={tld}
                href={`/browse?tld=${tld}`}
                className={`rounded-2xl border-2 p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${TLD_STYLES[tld]}`}
              >
                <span className="text-2xl font-bold">.{tld}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-24 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
              Three simple steps to buy or sell domains at a fixed price
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl shadow-primary-500/25 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary-500/30 transition-all duration-300">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">
                Sellers List
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Domain owners list domains they don&apos;t plan to renew. <span className="font-semibold text-emerald-600">Free to list</span>. We take $2 from the sale.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl shadow-primary-500/25 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary-500/30 transition-all duration-300">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">
                Buyers Browse
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find domains at a fixed $99 price. No negotiation. No hidden fees. AI helps surface the best picks.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl shadow-primary-500/25 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary-500/30 transition-all duration-300">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">
                Transfer Complete
              </h3>
              <p className="text-gray-600 leading-relaxed">
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
        <section className="py-16 md:py-20 bg-white border-t border-gray-200/60">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <DomainAlertsForm />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative bg-gradient-to-b from-[#0c0a1d] via-[#0f0d24] to-[#13102b] py-20 md:py-24 overflow-hidden">
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-30 mix-blend-soft-light pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite]" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[150px] animate-[pulse_14s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[180px] animate-[pulse_10s_ease-in-out_infinite]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Got domains you&apos;re not renewing?
          </h2>
          <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
            Turn your expiring domains into cash. <span className="font-semibold text-amber-300">Free to list</span>, sell for $99.
          </p>
          <Link href="/signup">
            <Button variant="secondary" size="lg" className="shadow-xl shadow-black/30 hover:shadow-2xl">
              Start Selling Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <div className="mt-8">
            <PaymentBadges className="[&>div]:bg-white/5 [&>div]:border [&>div]:border-white/10 [&>div]:text-gray-400" />
          </div>
        </div>
      </section>
    </div>
  );
}
