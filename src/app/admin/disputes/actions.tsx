'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface AdminDisputeActionsProps {
  dispute: {
    id: string;
    buyer_email: string;
    listing?: {
      domain_name: string;
    };
  };
}

export function AdminDisputeActions({ dispute }: AdminDisputeActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (outcome: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId: dispute.id, outcome }),
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
          if (confirm(`Refund buyer (${dispute.buyer_email}) for ${dispute.listing?.domain_name}?`)) {
            handleAction('buyer_refunded');
          }
        }}
        disabled={loading}
        className="text-orange-600 hover:text-orange-700"
      >
        Refund Buyer
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (confirm(`Pay seller for ${dispute.listing?.domain_name}? This closes the dispute in seller's favor.`)) {
            handleAction('seller_paid');
          }
        }}
        disabled={loading}
        className="text-green-600 hover:text-green-700"
      >
        Pay Seller
      </Button>
    </div>
  );
}
