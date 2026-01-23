import { DomainCard } from './domain-card';
import type { Listing } from '@/types/database';

interface DomainGridProps {
  listings: Listing[];
}

export function DomainGrid({ listings }: DomainGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No domains found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map((listing) => (
        <DomainCard
          key={listing.id}
          listing={listing}
          isSponsored={listing.is_sponsored}
        />
      ))}
    </div>
  );
}
