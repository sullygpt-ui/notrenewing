'use client';

import { TrendingUp, Users, ShoppingCart, Sparkles } from 'lucide-react';

interface SocialProofProps {
  soldThisWeek: number;
  activeListings: number;
  totalSold: number;
}

export function SocialProof({ soldThisWeek, activeListings, totalSold }: SocialProofProps) {
  // If we're in early launch mode (low activity), show a different message
  const isEarlyLaunch = soldThisWeek === 0 && totalSold === 0;
  
  if (isEarlyLaunch) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="font-medium text-gray-900">Now in Beta</span>
        </div>
        {activeListings > 0 && (
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <span>
              <strong className="text-gray-900">{activeListings}</strong> domain{activeListings !== 1 ? 's' : ''} available
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4 text-blue-500" />
          <span>Early sellers get <strong className="text-green-600">free listings</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
      {soldThisWeek > 0 && (
        <div className="flex items-center gap-2 text-gray-600">
          <ShoppingCart className="w-4 h-4 text-green-500" />
          <span>
            <strong className="text-gray-900">{soldThisWeek}</strong> sold this week
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 text-gray-600">
        <TrendingUp className="w-4 h-4 text-primary-500" />
        <span>
          <strong className="text-gray-900">{activeListings}</strong> domain{activeListings !== 1 ? 's' : ''} available
        </span>
      </div>
      {totalSold > 0 && (
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4 text-blue-500" />
          <span>
            <strong className="text-gray-900">{totalSold}</strong> successful transfer{totalSold !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
