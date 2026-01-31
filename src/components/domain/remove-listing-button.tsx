'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RemoveListingButtonProps {
  listingId: string;
  domainName: string;
}

export function RemoveListingButton({ listingId, domainName }: RemoveListingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/remove`, {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove listing');
      }
    } catch (error) {
      alert('Failed to remove listing');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Remove {domainName}?</span>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
      title="Remove listing"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
