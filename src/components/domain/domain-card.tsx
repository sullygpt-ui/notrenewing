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

// TLD color mapping for visual differentiation
const TLD_COLORS: Record<string, { bg: string; text: string }> = {
  com: { bg: 'bg-blue-100', text: 'text-blue-700' },
  net: { bg: 'bg-green-100', text: 'text-green-700' },
  org: { bg: 'bg-purple-100', text: 'text-purple-700' },
  io: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  ai: { bg: 'bg-pink-100', text: 'text-pink-700' },
  co: { bg: 'bg-teal-100', text: 'text-teal-700' },
  app: { bg: 'bg-orange-100', text: 'text-orange-700' },
  dev: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
};

// AI tier display
const AI_TIERS: Record<string, { label: string; color: string; stars: number }> = {
  S: { label: 'S-Tier', color: 'text-yellow-500', stars: 5 },
  A: { label: 'A-Tier', color: 'text-purple-500', stars: 4 },
  B: { label: 'B-Tier', color: 'text-blue-500', stars: 3 },
  C: { label: 'C-Tier', color: 'text-gray-500', stars: 2 },
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
  const tldColor = TLD_COLORS[listing.tld] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  const aiTier = listing.ai_tier ? AI_TIERS[listing.ai_tier] : null;

  return (
    <Link href={`/domain/${listing.domain_name}`}>
      <div className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300">
        {isSponsored && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">
            Sponsored
          </span>
        )}
        {listing.staff_pick && !isSponsored && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Staff Pick
          </span>
        )}
        {showWatchlistButton && (
          <div className="absolute top-2 right-2">
            <WatchlistButton listingId={listing.id} isWatched={isWatched} size="sm" />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Domain name - no truncation, wrap if needed */}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 break-all leading-tight">
              {listing.domain_name}
            </h3>
            
            {/* Badges row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Colored TLD badge */}
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full ${tldColor.bg} ${tldColor.text}`}>
                .{listing.tld}
              </span>
              
              {/* AI Tier badge with tooltip */}
              {aiTier && (
                <Tooltip 
                  content={
                    <div className="max-w-[200px]">
                      <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 text-yellow-400" />
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
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-50 ${aiTier.color} cursor-help hover:bg-gray-100 transition-colors`}>
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
            <div className="flex items-center gap-3 mt-2 text-xs">
              {domainAge && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-3 h-3" />
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
                    <Flame className="w-3 h-3" />
                  ) : expirationInfo.urgent ? (
                    <Clock className="w-3 h-3" />
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
            <span className="text-2xl font-bold text-gray-900">$99</span>
            <p className="text-xs font-semibold text-white bg-primary-600 px-3 py-1.5 rounded-lg mt-1 group-hover:bg-primary-700 transition-colors">
              Buy Now
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
