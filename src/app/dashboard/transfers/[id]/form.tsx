'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';

interface SellerTransferFormProps {
  purchaseId: string;
  domainName: string;
}

export function SellerTransferForm({ purchaseId, domainName }: SellerTransferFormProps) {
  const router = useRouter();
  const [authCode, setAuthCode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authCode.trim()) {
      setError('Authorization code is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transfers/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseId,
          authCode: authCode.trim(),
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit transfer information');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Transfer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-yellow-900 mb-2">Before You Submit</h4>
          <ol className="list-decimal list-inside text-yellow-800 text-sm space-y-1">
            <li>Log into your domain registrar (GoDaddy, Namecheap, etc.)</li>
            <li>Unlock the domain for transfer</li>
            <li>Disable privacy/WHOIS protection if enabled</li>
            <li>Get the authorization/EPP code for the domain</li>
          </ol>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Authorization Code (EPP/Auth Code)"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="e.g., Abc123!@#xyz"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This is the code the buyer needs to transfer the domain to their registrar.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for the buyer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500">
              E.g., &quot;I initiated the transfer from my side, please check your email to approve.&quot;
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Transfer Information'}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• The buyer will be notified immediately via email</li>
            <li>• They have 7 days to confirm receipt of the domain</li>
            <li>• Once confirmed, your payout will be processed automatically</li>
            <li>• If they don&apos;t respond in 7 days, payment is auto-released to you</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
