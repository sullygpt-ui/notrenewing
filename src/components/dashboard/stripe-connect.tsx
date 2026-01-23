'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface StripeConnectStatus {
  connected: boolean;
  status: string;
  detailsSubmitted?: boolean;
}

export function StripeConnectCard() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch Stripe status:', error);
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        alert('Failed to start Stripe onboarding');
      }
    } catch (error) {
      alert('Failed to connect to Stripe');
    }
    setConnecting(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-gray-100 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Stripe Connected</p>
                <p className="text-sm text-gray-500">You&apos;ll receive payouts automatically when sales complete.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleConnect}>
              Update Payout Settings
            </Button>
          </div>
        ) : status?.status === 'pending' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Setup Incomplete</p>
                <p className="text-sm text-gray-500">Complete your Stripe account setup to receive payouts.</p>
              </div>
            </div>
            <Button onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Redirecting...' : 'Complete Setup'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Connect your Stripe account to receive payouts when your domains sell.
              Payouts are processed automatically when buyers confirm receipt.
            </p>
            <Button onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Redirecting...' : 'Connect Stripe Account'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
