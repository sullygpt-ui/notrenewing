'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface RescoreDomainButtonProps {
  listingId: string;
  domainName: string;
}

export function RescoeDomainButton({ listingId, domainName }: RescoreDomainButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRescore = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/domains/rescore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, domainName }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to rescore domain');
      }
    } catch (err) {
      alert('Failed to rescore domain');
    }
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRescore}
      disabled={loading}
    >
      {loading ? 'Rescoring...' : 'Rescore'}
    </Button>
  );
}
