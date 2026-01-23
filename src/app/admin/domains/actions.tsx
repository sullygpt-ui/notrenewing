'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

const STATUSES = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'sold', label: 'Sold' },
  { value: 'expired', label: 'Expired' },
  { value: 'removed', label: 'Removed' },
];

interface AdminDomainActionsProps {
  listing: {
    id: string;
    domain_name: string;
    admin_featured: boolean;
    admin_hidden: boolean;
    staff_pick: boolean;
    status: string;
  };
  showStatusDropdown?: boolean;
}

export function AdminDomainActions({ listing, showStatusDropdown = false }: AdminDomainActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string, value?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, action, value }),
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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus !== listing.status) {
      if (confirm(`Change status to "${newStatus.replace(/_/g, ' ')}"?`)) {
        handleAction('set_status', newStatus);
      } else {
        e.target.value = listing.status;
      }
    }
  };

  return (
    <div className="flex items-center gap-2 justify-end flex-wrap">
      {showStatusDropdown && (
        <select
          value={listing.status}
          onChange={handleStatusChange}
          disabled={loading}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      )}
      {listing.status === 'active' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(listing.staff_pick ? 'unstaff_pick' : 'staff_pick')}
            disabled={loading}
            className="text-yellow-600 hover:text-yellow-700"
          >
            {listing.staff_pick ? 'Remove Staff Pick' : 'Staff Pick'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(listing.admin_featured ? 'unfeature' : 'feature')}
            disabled={loading}
          >
            {listing.admin_featured ? 'Unfeature' : 'Feature'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(listing.admin_hidden ? 'unhide' : 'hide')}
            disabled={loading}
          >
            {listing.admin_hidden ? 'Unhide' : 'Hide'}
          </Button>
        </>
      )}
      {listing.status !== 'sold' && listing.status !== 'removed' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm(`Remove ${listing.domain_name}?`)) {
              handleAction('remove');
            }
          }}
          disabled={loading}
          className="text-red-600 hover:text-red-700"
        >
          Remove
        </Button>
      )}
    </div>
  );
}
