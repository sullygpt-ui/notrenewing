'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface TwoFactorChallengeProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorChallenge({ userId, onSuccess, onCancel }: TwoFactorChallengeProps) {
  const [mode, setMode] = useState<'totp' | 'backup'>('totp');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const verify = async () => {
    setIsLoading(true);
    setError('');

    try {
      const endpoint = mode === 'totp' ? '/api/auth/2fa/verify' : '/api/auth/2fa/backup';
      const body = mode === 'totp' ? { token: code } : { code, userId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Two-Factor Authentication
      </h2>

      {mode === 'totp' ? (
        <>
          <p className="text-gray-600 mb-4 text-center">
            Enter the 6-digit code from your authenticator app
          </p>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-lg tracking-widest mb-4"
            autoFocus
          />
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-4 text-center">
            Enter one of your backup codes
          </p>
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            maxLength={9}
            className="text-center text-lg tracking-widest mb-4"
            autoFocus
          />
        </>
      )}

      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

      <div className="flex flex-col gap-2">
        <Button
          onClick={verify}
          disabled={isLoading || (mode === 'totp' ? code.length !== 6 : code.length < 8)}
          className="w-full"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>

      <button
        onClick={() => {
          setMode(mode === 'totp' ? 'backup' : 'totp');
          setCode('');
          setError('');
        }}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
      >
        {mode === 'totp' ? 'Use a backup code instead' : 'Use authenticator app'}
      </button>
    </div>
  );
}
