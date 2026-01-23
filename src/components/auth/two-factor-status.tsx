'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface TwoFactorStatusProps {
  enabledAt: string | null;
}

export function TwoFactorStatus({ enabledAt }: TwoFactorStatusProps) {
  const [showDisable, setShowDisable] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const disable2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  if (showDisable) {
    return (
      <div>
        <p className="text-gray-600 mb-4">
          Enter your authenticator code to disable 2FA:
        </p>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="max-w-[150px] text-center text-lg tracking-widest"
          />
          <Button
            variant="danger"
            onClick={disable2FA}
            disabled={isLoading || token.length !== 6}
          >
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          onClick={() => {
            setShowDisable(false);
            setToken('');
            setError('');
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-green-600 text-xl">&#10003;</span>
        <span className="text-green-600 font-medium">2FA is enabled</span>
      </div>
      {enabledAt && (
        <p className="text-sm text-gray-500 mb-4">
          Enabled on {new Date(enabledAt).toLocaleDateString()}
        </p>
      )}
      <Button variant="outline" onClick={() => setShowDisable(true)}>
        Disable 2FA
      </Button>
    </div>
  );
}
