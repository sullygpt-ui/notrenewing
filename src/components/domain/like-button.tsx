'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  listingId: string;
  initialLikeCount?: number;
  initialHasLiked?: boolean;
  size?: 'sm' | 'md';
  showCount?: boolean;
}

export function LikeButton({ 
  listingId, 
  initialLikeCount = 0, 
  initialHasLiked = false,
  size = 'md',
  showCount = true
}: LikeButtonProps) {
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch initial like state on mount
  useEffect(() => {
    const fetchLikeState = async () => {
      try {
        const response = await fetch(`/api/likes?listingId=${listingId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setHasLiked(data.hasLiked);
          setLikeCount(data.likeCount);
        }
      } catch (error) {
        console.error('Failed to fetch like state:', error);
      }
    };
    fetchLikeState();
  }, [listingId]);

  const handleClick = async () => {
    if (loading) return;
    
    setLoading(true);
    
    // Optimistic update
    const wasLiked = hasLiked;
    setHasLiked(!hasLiked);
    setLikeCount(prev => hasLiked ? prev - 1 : prev + 1);
    
    try {
      const response = await fetch('/api/likes', {
        method: hasLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
        credentials: 'include',
      });

      // Redirect to login if not authenticated
      if (response.status === 401) {
        // Revert optimistic update
        setHasLiked(wasLiked);
        setLikeCount(prev => wasLiked ? prev : prev - 1);
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setLikeCount(data.likeCount);
      } else {
        // Revert optimistic update on error
        setHasLiked(wasLiked);
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Failed to update like:', error);
      // Revert optimistic update
      setHasLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs gap-1' 
    : 'px-2.5 py-1.5 text-sm gap-1.5';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`${sizeClasses} inline-flex items-center rounded-lg font-medium transition-all ${
        hasLiked 
          ? 'text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200' 
          : 'text-gray-500 hover:text-primary-600 hover:bg-gray-100 border border-transparent'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={hasLiked ? 'Unlike this domain' : 'Like this domain'}
    >
      <ThumbsUp className={`${iconSize} ${hasLiked ? 'fill-current' : ''}`} />
      {showCount && <span>{likeCount}</span>}
    </button>
  );
}
