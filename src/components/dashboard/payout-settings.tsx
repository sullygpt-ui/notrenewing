'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface PayoutSettings {
  payout_method: 'paypal' | null;
  paypal_email: string | null;
}

export function PayoutSettings() {
  const [settings, setSettings] = useState<PayoutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
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
        setPaypalEmail(data.paypal_email || '');
      }
    } catch (error) {
      console.error('Failed to fetch payout settings:', error);
    }
    setLoading(false);
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
          payout_method: 'paypal',
          paypal_email: paypalEmail,
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
          Enter your PayPal email to receive payouts when your domains sell.
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
          <Input
            type="email"
            placeholder="your-email@example.com"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            label="PayPal Email"
          />
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={saving || !paypalEmail}
          >
            {saving ? 'Saving...' : 'Save Payout Settings'}
          </Button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Seller payouts are $97 per sale ($99 minus $2 platform fee).
          PayPal fees may apply. Payouts are sent within 24 hours of buyer confirmation.
        </p>
      </CardContent>
    </Card>
  );
}
