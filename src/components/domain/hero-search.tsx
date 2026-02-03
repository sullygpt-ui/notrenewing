'use client';

import { SearchBar } from '@/components/ui';

export function HeroSearch() {
  return (
    <div className="w-full">
      <SearchBar
        size="lg"
        placeholder="Search for a domain name..."
        autoFocus={false}
      />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Try: tech, cloud, app, ai, startup...
      </p>
    </div>
  );
}
