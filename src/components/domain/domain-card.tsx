import Link from 'next/link';
import { Clock, Flame, Star, Calendar, Sparkles } from 'lucide-react';
import { Badge, Tooltip } from '@/components/ui';
import { WatchlistButton } from './watchlist-button';
import { LikeButton } from './like-button';
import type { Listing } from '@/types/database';

interface DomainCardProps {
  listing: Listing;
  isSponsored?: boolean;
  isWatched?: boolean;
  showWatchlistButton?: boolean;
  showLikeButton?: boolean;
}

// TLD color mapping - refined, more subtle palette
const TLD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  com: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  net: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  org: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  io: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  ai: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-200' },
  co: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
  app: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  dev: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
};

// AI tier display - refined styling
const AI_TIERS: Record<string, { label: string; color: string; bgColor: string; stars: number }> = {
  S: { label: 'S-Tier', color: 'text-amber-600', bgColor: 'bg-amber-50', stars: 5 },
  A: { label: 'A-Tier', color: 'text-violet-600', bgColor: 'bg-violet-50', stars: 4 },
  B: { label: 'B-Tier', color: 'text-blue-600', bgColor: 'bg-blue-50', stars: 3 },
  C: { label: 'C-Tier', color: 'text-gray-500', bgColor: 'bg-gray-50', stars: 2 },
};

export function DomainCard({ listing, isSponsored = false, isWatched = false, showWatchlistButton = false, showLikeButton = true }: DomainCardProps) {

  const getExpirationInfo = (date: string | null) => {
    if (!date) return null;
    const expDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 7) {
      return { text: `${daysUntil}d left`, urgent: true, critical: true };
    }
    if (daysUntil <= 14) {
      return { text: `${daysUntil} days left`, urgent: true, critical: false };
    }
    if (daysUntil <= 30) {
      return { text: `${daysUntil} days left`, urgent: false, critical: false };
    }
    return { 
      text: `Exp ${expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`, 
      urgent: false, 
      critical: false 
    };
  };

  const getDomainAge = (months: number | null) => {
    if (!months) return null;
    if (months < 12) return `${months}mo old`;
    const years = Math.floor(months / 12);
    return `${years}yr${years > 1 ? 's' : ''} old`;
  };

  const expirationInfo = getExpirationInfo(listing.expiration_date);
  const domainAge = getDomainAge(listing.domain_age_months);
  const tldColor = TLD_COLORS[listing.tld] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  const aiTier = listing.ai_tier ? AI_TIERS[listing.ai_tier] : null;

  return (
    <Link href={`/domain/${listing.domain_name}`}>
      <div className="group relative bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm shadow-gray-900/5 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-300 hover:-translate-y-1 transition-all duration-300">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-50/0 to-primary-100/0 group-hover:from-primary-50/50 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
        
        {isSponsored && (
          <span className="absolute -top-2.5 -right-2.5 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-amber-500/25">
            Sponsored
          </span>
        )}
        {listing.staff_pick && !isSponsored && (
          <span className="absolute -top-2.5 -right-2.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg shadow-orange-500/25">
            <Star className="w-3 h-3 fill-current" /> Staff Pick
          </span>
        )}
        {showWatchlistButton && (
          <div className="absolute top-3 right-3 z-10">
            <WatchlistButton listingId={listing.id} isWatched={isWatched} size="sm" />
          </div>
        )}

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Domain name */}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 break-all leading-tight tracking-tight">
              {listing.domain_name}
            </h3>
            
            {/* Badges row */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Colored TLD badge */}
              <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${tldColor.bg} ${tldColor.text} ${tldColor.border}`}>
                .{listing.tld}
              </span>
              
              {/* AI Tier badge with tooltip */}
              {aiTier && (
                <Tooltip 
                  content={
                    <div className="max-w-[200px]">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="font-semibold">AI Score: {aiTier.label}</span>
                      </div>
                      {listing.ai_reasoning && (
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {listing.ai_reasoning}
                        </p>
                      )}
                    </div>
                  }
                  position="bottom"
                >
                  <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 text-xs font-medium rounded-full border border-transparent ${aiTier.bgColor} ${aiTier.color} cursor-help hover:border-current/20 transition-colors`}>
                    {[...Array(aiTier.stars)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </span>
                </Tooltip>
              )}
              
              {/* Category badge */}
              {listing.category && (
                <Badge variant="secondary" size="sm">
                  {listing.category}
                </Badge>
              )}
            </div>
            
            {/* Domain age & expiration info */}
            <div className="flex items-center gap-3 mt-3 text-xs">
              {domainAge && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {domainAge}
                </span>
              )}
              {expirationInfo && (
                <span className={`flex items-center gap-1 font-medium ${
                  expirationInfo.critical 
                    ? 'text-red-600' 
                    : expirationInfo.urgent 
                      ? 'text-orange-600' 
                      : 'text-gray-500'
                }`}>
                  {expirationInfo.critical ? (
                    <Flame className="w-3.5 h-3.5" />
                  ) : expirationInfo.urgent ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : null}
                  {expirationInfo.text}
                </span>
              )}
              {showLikeButton && (
                <LikeButton 
                  listingId={listing.id} 
                  initialLikeCount={listing.like_count || 0}
                  size="sm"
                />
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">$99</span>
            <div className="mt-2">
              <span className="inline-flex items-center justify-center text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 rounded-xl shadow-md shadow-primary-500/25 group-hover:shadow-lg group-hover:shadow-primary-500/30 group-hover:from-primary-500 group-hover:to-primary-600 transition-all">
                Buy Now
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
