'use client';

import Link from 'next/link';
import { Star, Sparkles, TrendingUp, Clock, Flame, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge, Tooltip } from '@/components/ui';
import type { Listing } from '@/types/database';

interface FeaturedDomainCardProps {
  listing: Listing;
}

const AI_TIERS: Record<string, { label: string; color: string; stars: number }> = {
  S: { label: 'S-Tier', color: 'text-amber-500', stars: 5 },
  A: { label: 'A-Tier', color: 'text-violet-500', stars: 4 },
  B: { label: 'B-Tier', color: 'text-blue-500', stars: 3 },
  C: { label: 'C-Tier', color: 'text-gray-500', stars: 2 },
};

export function FeaturedDomainCard({ listing }: FeaturedDomainCardProps) {
  const aiTier = listing.ai_tier ? AI_TIERS[listing.ai_tier] : null;

  const getExpirationInfo = (date: string | null) => {
    if (!date) return null;
    const expDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 7) return { text: `${daysUntil}d left`, urgent: true, critical: true };
    if (daysUntil <= 14) return { text: `${daysUntil} days left`, urgent: true, critical: false };
    if (daysUntil <= 30) return { text: `${daysUntil} days left`, urgent: false, critical: false };
    return { 
      text: `Expires ${expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`, 
      urgent: false, 
      critical: false 
    };
  };

  const getDomainAge = (months: number | null) => {
    if (!months) return null;
    if (months < 12) return `${months} months old`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} old`;
  };

  const expirationInfo = getExpirationInfo(listing.expiration_date);
  const domainAge = getDomainAge(listing.domain_age_months);

  return (
    <Link href={`/domain/${listing.domain_name}`}>
      <motion.div 
        className="group relative"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Animated gradient border */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-primary-500 via-violet-500 to-amber-500 rounded-3xl opacity-75 blur-sm group-hover:opacity-100 group-hover:blur transition-all duration-300" />
        <div className="absolute -inset-[2px] bg-gradient-to-r from-primary-500 via-violet-500 to-amber-500 rounded-3xl opacity-0 group-hover:opacity-100 animate-[spin_3s_linear_infinite]" style={{ backgroundSize: '200% 200%' }} />
        
        <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
          {/* Featured badge */}
          <div className="absolute -top-3 left-8">
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-amber-500/30">
              <TrendingUp className="w-4 h-4" />
              Featured Domain
            </div>
          </div>

          <div className="pt-4">
            {/* Domain name - large and prominent */}
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight mb-4">
              {listing.domain_name}
            </h3>

            {/* AI Score showcase */}
            {aiTier && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-gray-900">AI Score:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${aiTier.color}`}>{aiTier.label}</span>
                  <div className="flex gap-0.5">
                    {[...Array(aiTier.stars)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 fill-current ${aiTier.color}`} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            {listing.ai_reasoning && (
              <p className="text-gray-600 mb-6 leading-relaxed">
                {listing.ai_reasoning}
              </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              {listing.category && (
                <Badge variant="secondary" size="md">{listing.category}</Badge>
              )}
              {domainAge && (
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {domainAge}
                </span>
              )}
              {expirationInfo && (
                <span className={`flex items-center gap-1.5 font-medium ${
                  expirationInfo.critical ? 'text-red-600' : expirationInfo.urgent ? 'text-orange-600' : 'text-gray-500'
                }`}>
                  {expirationInfo.critical ? <Flame className="w-4 h-4" /> : expirationInfo.urgent ? <Clock className="w-4 h-4" /> : null}
                  {expirationInfo.text}
                </span>
              )}
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div>
                <span className="text-sm text-gray-500">Fixed Price</span>
                <p className="text-4xl font-bold text-gray-900">$99</p>
              </div>
              <div className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-all">
                Buy Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
