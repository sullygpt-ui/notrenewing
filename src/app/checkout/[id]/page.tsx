'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';
import type { Listing } from '@/types/database';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [listing, setListing] = useState<Listing | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .eq('status', 'active')
        .single();

      if (data) {
        setListing(data as Listing);
      }
      setLoading(false);
    };

    fetchListing();
  }, [params.id, supabase]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: params.id,
          buyerEmail: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Domain Not Found</h1>
        <p className="text-gray-500 mb-8">
          This domain may have been sold or is no longer available.
        </p>
        <Link href="/browse">
          <Button>Browse Domains</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/domain/${listing.domain_name}`} className="text-sm text-primary-600 hover:underline">
          &larr; Back to domain
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Complete Your Purchase</h1>

      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Domain</p>
              <p className="text-xl font-bold text-gray-900">{listing.domain_name}</p>
            </div>
            <Badge variant="default">.{listing.tld}</Badge>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Domain price</span>
              <span className="font-medium">$99.00</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Processing fee</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>$99.00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <form onSubmit={handleCheckout}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mb-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="We'll send transfer instructions to this email"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={submitting}>
              Pay $99.00
            </Button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              By completing this purchase, you agree to our{' '}
              <Link href="/terms" className="underline">Terms of Service</Link>.
              Payment is held until domain transfer is confirmed.
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Secure payment powered by Stripe</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Funds held until transfer is complete</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Full refund if transfer fails</span>
        </div>
      </div>
    </div>
  );
}
