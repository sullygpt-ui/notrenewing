'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WatchlistButtonProps {
  listingId: string;
  isWatched: boolean;
  onToggle?: (isWatched: boolean) => void;
  size?: 'sm' | 'md';
}

export function WatchlistButton({ listingId, isWatched: initialIsWatched, onToggle, size = 'md' }: WatchlistButtonProps) {
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    setLoading(true);
    try {
      const response = await fetch('/api/watchlist', {
        method: isWatched ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
        credentials: 'include',
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.ok) {
        setIsWatched(!isWatched);
        onToggle?.(!isWatched);
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopEvent = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const sizeClasses = size === 'sm' 
    ? 'p-1.5' 
    : 'p-2';

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={stopEvent}
      onTouchStart={stopEvent}
      disabled={loading}
      className={`${sizeClasses} rounded-lg transition-colors ${
        isWatched 
          ? 'text-red-500 bg-red-50 hover:bg-red-100' 
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <Heart className={`${iconSize} ${isWatched ? 'fill-current' : ''}`} />
    </button>
  );
}
