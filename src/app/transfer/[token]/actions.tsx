'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

interface TransferActionsProps {
  purchaseId: string;
  isPastTransferDeadline: boolean;
  hasTransferInfo: boolean;
}

export function TransferActions({ purchaseId, isPastTransferDeadline, hasTransferInfo }: TransferActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const handleConfirm = async () => {
    if (!confirm('Are you sure you have received and have control of this domain? This action cannot be undone and will release payment to the seller.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/transfers/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to confirm transfer');
      }
    } catch (err) {
      alert('An error occurred');
    }
    setLoading(false);
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for the dispute');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/transfers/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId, reason: disputeReason }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to open dispute');
      }
    } catch (err) {
      alert('An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {hasTransferInfo ? (
        <>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : 'Confirm I Received the Domain'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            Only click this after you have successfully transferred the domain to your registrar account.
          </p>
        </>
      ) : (
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-gray-600 text-sm">
            Waiting for seller to provide transfer information...
          </p>
        </div>
      )}

      {!showDispute ? (
        <button
          onClick={() => setShowDispute(true)}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          Having trouble? Open a dispute
        </button>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Open a Dispute</h4>
          <p className="text-sm text-gray-600">
            {isPastTransferDeadline && !hasTransferInfo
              ? 'The 72-hour transfer deadline has passed and the seller has not provided transfer information.'
              : hasTransferInfo
              ? 'Please describe the issue you are experiencing with this transfer.'
              : 'Please describe why you are opening a dispute.'}
          </p>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="Describe your issue..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleDispute}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Submit Dispute
            </Button>
            <Button
              onClick={() => setShowDispute(false)}
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
