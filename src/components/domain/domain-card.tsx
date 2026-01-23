import Link from 'next/link';
import { Badge } from '@/components/ui';
import type { Listing } from '@/types/database';

interface DomainCardProps {
  listing: Listing;
  isSponsored?: boolean;
}

export function DomainCard({ listing, isSponsored = false }: DomainCardProps) {

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
        {listing.staff_pick && !isSponsored && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
            Staff Pick
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
            </div>
            {listing.expiration_date && (
              <p className="text-xs text-gray-500 mt-2">
                {formatExpirationDate(listing.expiration_date)}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">$99</span>
            <p className="text-xs font-medium text-white bg-primary-600 px-2 py-1 rounded mt-1">Buy Now!</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
