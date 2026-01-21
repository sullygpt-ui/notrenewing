import Link from 'next/link';
import { Badge } from '@/components/ui';
import type { Listing } from '@/types/database';

interface DomainCardProps {
  listing: Listing;
  showTier?: boolean;
  isSponsored?: boolean;
}

export function DomainCard({ listing, showTier = true, isSponsored = false }: DomainCardProps) {
  const tierColors = {
    high: 'success',
    medium: 'info',
    low: 'default',
  } as const;

  const formatExpirationDate = (date: string | null) => {
    if (!date) return null;
    const expDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 30) {
      return `Expires in ${daysUntil} days`;
    }
    return `Expires ${expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  return (
    <Link href={`/domain/${listing.domain_name}`}>
      <div className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-md transition-all">
        {isSponsored && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            Sponsored
          </span>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600">
              {listing.domain_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" size="sm">
                .{listing.tld}
              </Badge>
              {showTier && listing.ai_tier && (
                <Badge variant={tierColors[listing.ai_tier]} size="sm">
                  {listing.ai_tier === 'high' ? 'High Interest' : listing.ai_tier === 'medium' ? 'Medium' : 'Standard'}
                </Badge>
              )}
            </div>
            {listing.expiration_date && (
              <p className="text-xs text-gray-500 mt-2">
                {formatExpirationDate(listing.expiration_date)}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">$99</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
