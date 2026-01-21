'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import type { Listing } from '@/types/database';

export default function VerifyListingPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.id }),
      });

      const data = await response.json();

      if (!data.verified) {
        setError(data.error || 'Verification failed');
        setVerifying(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Verification request failed. Please try again.');
      setVerifying(false);
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

  if (listing.status !== 'pending_verification') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Verified</h1>
        <p className="text-gray-500 mb-8">This listing has already been verified.</p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Verification Successful!</h1>
        <p className="text-gray-500">Your domain is now live on the marketplace.</p>
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

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Domain Ownership</h1>
      <p className="text-gray-500 mb-8">Complete DNS verification to list your domain</p>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{listing.domain_name}</CardTitle>
            <Badge variant="warning">Pending Verification</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-4">Add this DNS TXT record:</h3>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 font-mono text-sm">
            <div className="mb-3">
              <span className="text-gray-500">Host/Name:</span>
              <br />
              <code className="text-gray-900">_notrenewing.{listing.domain_name}</code>
            </div>
            <div className="mb-3">
              <span className="text-gray-500">Type:</span>
              <br />
              <code className="text-gray-900">TXT</code>
            </div>
            <div>
              <span className="text-gray-500">Value:</span>
              <br />
              <code className="text-gray-900">notrenewing-verify={listing.verification_token}</code>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 mb-6">
            <strong>Note:</strong> DNS changes can take up to 48 hours to propagate, but usually complete within a few minutes.
            Make sure you add the record to the correct zone (your domain registrar or DNS provider).
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <Button onClick={handleVerify} isLoading={verifying} className="w-full">
            Verify DNS Record
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h3 className="font-semibold text-gray-900 mb-3">Common Issues</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Make sure you're adding a TXT record, not a CNAME or A record</li>
            <li>• Some registrars require you to omit the domain from the host (use just <code>_notrenewing</code>)</li>
            <li>• Wait a few minutes after adding the record before verifying</li>
            <li>• Check that you don't have quotes around the value</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
