'use client';

import { SearchBar } from '@/components/ui';

export function HeroSearch() {
  return (
    <div className="max-w-xl mx-auto">
      <SearchBar
        size="lg"
        placeholder="Search for a domain name..."
        autoFocus={false}
      />
      <p className="text-sm text-white/80 mt-3">
        Try: tech, cloud, app, ai, startup...
      </p>
    </div>
  );
}
