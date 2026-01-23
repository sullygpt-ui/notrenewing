'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface ListingFiltersProps {
  counts: {
    all: number;
    pending_payment: number;
    pending_verification: number;
    active: number;
    sold: number;
  };
  basePath?: string;
}

export function ListingFilters({ counts, basePath = '/dashboard' }: ListingFiltersProps) {
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('status') || 'all';

  const filters: FilterOption[] = [
    { label: 'All', value: 'all', count: counts.all },
    { label: 'Pending Payment', value: 'pending_payment', count: counts.pending_payment },
    { label: 'Pending Verification', value: 'pending_verification', count: counts.pending_verification },
    { label: 'Active', value: 'active', count: counts.active },
    { label: 'Sold', value: 'sold', count: counts.sold },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <Link
          key={filter.value}
          href={filter.value === 'all' ? basePath : `${basePath}?status=${filter.value}`}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentFilter === filter.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {filter.label}
          {filter.count !== undefined && filter.count > 0 && (
            <span
              className={clsx(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                currentFilter === filter.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              )}
            >
              {filter.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
