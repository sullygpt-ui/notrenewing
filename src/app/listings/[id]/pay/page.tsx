'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import type { Listing } from '@/types/database';

export default function PayListingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .eq('seller_id', user.id)
        .single();

      if (data) {
        setListing(data as Listing);
      }
      setLoading(false);
    };

    fetchListing();
  }, [params.id, router, supabase]);

  const handlePay = async () => {
    setPaying(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/listing-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingIds: [params.id] }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create payment session');
        setPaying(false);
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (listing.status !== 'pending_payment') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Required</h1>
        <p className="text-gray-500 mb-8">This listing does not require payment.</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-primary-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h1>
      <p className="text-gray-500 mb-8">Pay the listing fee to continue with verification</p>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{listing.domain_name}</CardTitle>
            <Badge variant="danger">Pending Payment</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Listing fee</span>
              <span className="font-semibold text-gray-900">$1.00</span>
            </div>
            <p className="text-xs text-gray-500">
              Non-refundable. Your domain will be listed for 30 days after verification.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-6">
            <strong>What happens next?</strong>
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>Complete payment via Stripe</li>
              <li>Receive verification instructions via email</li>
              <li>Add DNS TXT record to verify ownership</li>
              <li>Your domain goes live on the marketplace</li>
            </ol>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <Button onClick={handlePay} isLoading={paying} className="w-full">
            Pay $1.00 & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
