'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface AdminPayoutActionsProps {
  payout: {
    id: string;
    seller_email: string;
    amount: number;
    payout_method: string;
  };
}

export function AdminPayoutActions({ payout }: AdminPayoutActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId: payout.id, action }),
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
          if (confirm(`Process payout of $${(payout.amount / 100).toFixed(2)} to ${payout.seller_email}?`)) {
            handleAction('process');
          }
        }}
        disabled={loading || payout.payout_method === 'Not set'}
        className="text-green-600 hover:text-green-700"
      >
        Process
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm(`Mark payout as completed for ${payout.seller_email}?`)) {
            handleAction('complete');
          }
        }}
        disabled={loading}
        className="text-blue-600 hover:text-blue-700"
      >
        Mark Complete
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm(`Cancel payout for ${payout.seller_email}?`)) {
            handleAction('cancel');
          }
        }}
        disabled={loading}
        className="text-red-600 hover:text-red-700"
      >
        Cancel
      </Button>
    </div>
  );
}
