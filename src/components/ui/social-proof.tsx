'use client';

import { TrendingUp, Users, ShoppingCart } from 'lucide-react';

interface SocialProofProps {
  soldThisWeek: number;
  activeListings: number;
  totalSold: number;
}

export function SocialProof({ soldThisWeek, activeListings, totalSold }: SocialProofProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <ShoppingCart className="w-4 h-4 text-green-500" />
        <span>
          <strong className="text-gray-900">{soldThisWeek}</strong> sold this week
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <TrendingUp className="w-4 h-4 text-primary-500" />
        <span>
          <strong className="text-gray-900">{activeListings}</strong> domains available
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Users className="w-4 h-4 text-blue-500" />
        <span>
          <strong className="text-gray-900">{totalSold}</strong> total transfers
        </span>
      </div>
    </div>
  );
}
