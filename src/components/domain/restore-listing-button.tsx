'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RestoreListingButtonProps {
  listingId: string;
}

export function RestoreListingButton({ listingId }: RestoreListingButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRestore = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/restore`, {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to restore listing');
      }
    } catch (error) {
      alert('Failed to restore listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRestore}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 disabled:opacity-50 transition-colors"
    >
      <RotateCcw className="w-3 h-3" />
      {loading ? 'Restoring...' : 'Restore'}
    </button>
  );
}
