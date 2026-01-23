'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface PayoutSettings {
  payout_method: 'stripe' | 'paypal' | null;
  paypal_email: string | null;
  stripe_connected: boolean;
}

export function PayoutSettings() {
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'paypal' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/payout-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setSelectedMethod(data.payout_method);
        setPaypalEmail(data.paypal_email || '');
      }
    } catch (error) {
      console.error('Failed to fetch payout settings:', error);
    }
    setLoading(false);
  };

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        setError('Failed to start Stripe onboarding');
      }
    } catch (error) {
      setError('Failed to connect to Stripe');
    }
    setConnecting(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch('/api/payout-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payout_method: selectedMethod,
          paypal_email: selectedMethod === 'paypal' ? paypalEmail : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccess('Payout settings saved successfully!');
      fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-32 bg-gray-100 rounded"></div>
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
        <p className="text-gray-600 mb-6">
          Choose how you want to receive payouts when your domains sell.
          Payouts are processed automatically when buyers confirm receipt.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Stripe Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === 'stripe'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => settings?.stripe_connected && setSelectedMethod('stripe')}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payout_method"
                  checked={selectedMethod === 'stripe'}
                  onChange={() => setSelectedMethod('stripe')}
                  disabled={!settings?.stripe_connected}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">Stripe</p>
                  <p className="text-sm text-gray-500">
                    Receive payouts directly to your bank account via Stripe
                  </p>
                </div>
              </div>
              {settings?.stripe_connected ? (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Connected
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectStripe();
                  }}
                  disabled={connecting}
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>

          {/* PayPal Option */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === 'paypal'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('paypal')}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="payout_method"
                checked={selectedMethod === 'paypal'}
                onChange={() => setSelectedMethod('paypal')}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">PayPal</p>
                <p className="text-sm text-gray-500 mb-3">
                  Receive payouts to your PayPal account
                </p>
                {selectedMethod === 'paypal' && (
                  <Input
                    type="email"
                    placeholder="your-email@example.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    label="PayPal Email"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || !selectedMethod || (selectedMethod === 'paypal' && !paypalEmail)}
          >
            {saving ? 'Saving...' : 'Save Payout Settings'}
          </Button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Seller payouts are $95.83 per sale ($99 minus 3.2% processing fee).
          Payouts are sent within 24 hours of buyer confirmation.
        </p>
      </CardContent>
    </Card>
  );
}
