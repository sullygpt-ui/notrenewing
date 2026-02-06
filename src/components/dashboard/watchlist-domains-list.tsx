'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ExternalLink, Trash2, Calendar, Lightbulb } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

interface WatchlistDomain {
  watchlistId: string;
  createdAt: string;
  id: string;
  domain_name: string;
  tld: string;
  status: string;
  ai_tier: string | null;
  category: string | null;
  expiration_date: string | null;
}

interface WatchlistDomainsListProps {
  domains: WatchlistDomain[];
}

export function WatchlistDomainsList({ domains: initialDomains }: WatchlistDomainsListProps) {
  const [domains, setDomains] = useState(initialDomains);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (watchlistId: string, listingId: string) => {
    setRemoving(watchlistId);
    
    try {
      const response = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });

      if (response.ok) {
        setDomains(prev => prev.filter(d => d.watchlistId !== watchlistId));
      }
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    } finally {
      setRemoving(null);
    }
  };

  const getExpirationDisplay = (date: string | null) => {
    if (!date) return null;
    const expDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7) return { text: `${daysUntil}d left`, urgent: true };
    if (daysUntil <= 30) return { text: `${daysUntil}d left`, urgent: false };
    return { text: expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), urgent: false };
  };

  if (domains.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>No saved domains yet</p>
        <Link href="/browse">
          <Button variant="outline" size="sm" className="mt-2">
            Browse Domains
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {domains.map((domain) => {
        const expDisplay = getExpirationDisplay(domain.expiration_date);
        const isActive = domain.status === 'active';
        
        return (
          <div key={domain.watchlistId} className="py-3 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link 
                  href={isActive ? `/domain/${domain.domain_name}` : '#'}
                  className={`font-medium ${isActive ? 'text-gray-900 hover:text-primary-600' : 'text-gray-400'}`}
                >
                  {domain.domain_name}
                </Link>
                <Badge 
                  variant={isActive ? 'success' : 'default'}
                  size="sm"
                >
                  .{domain.tld}
                </Badge>
                {!isActive && (
                  <Badge variant="secondary" size="sm">
                    {domain.status === 'sold' ? 'Sold' : 'Unavailable'}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                {domain.category && (
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    {domain.category}
                  </span>
                )}
                {expDisplay && isActive && (
                  <span className={`flex items-center gap-1 ${expDisplay.urgent ? 'text-orange-600 font-medium' : ''}`}>
                    <Calendar className="w-3 h-3" />
                    {expDisplay.text}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isActive && (
                <Link href={`/domain/${domain.domain_name}`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    View
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(domain.watchlistId, domain.id)}
                disabled={removing === domain.watchlistId}
                className="text-gray-400 hover:text-red-500"
                title="Remove from saved"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
