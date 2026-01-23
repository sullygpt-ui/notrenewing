'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface AdminSellerActionsProps {
  seller: {
    id: string;
    email: string;
    is_suspended: boolean;
  };
}

export function AdminSellerActions({ seller }: AdminSellerActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: seller.id, action }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      alert('Action failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const action = seller.is_suspended ? 'unsuspend' : 'suspend';
          if (!seller.is_suspended && !confirm(`Suspend ${seller.email}?`)) return;
          handleAction(action);
        }}
        disabled={loading}
        className={seller.is_suspended ? '' : 'text-red-600 hover:text-red-700'}
      >
        {seller.is_suspended ? 'Unsuspend' : 'Suspend'}
      </Button>
    </div>
  );
}
