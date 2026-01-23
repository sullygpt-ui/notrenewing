'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';

type SetupStep = 'intro' | 'qr' | 'verify' | 'backup' | 'complete';

export function TwoFactorSetup() {
  const [step, setStep] = useState<SetupStep>('intro');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start setup');
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('qr');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start setup');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid token');
      }

      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify token');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  if (step === 'intro') {
    return (
      <div>
        <p className="text-gray-600 mb-4">
          Two-factor authentication adds an extra layer of security to your account.
          You&apos;ll need an authenticator app like Google Authenticator, Authy, or 1Password.
        </p>
        <Button onClick={startSetup} disabled={isLoading}>
          {isLoading ? 'Setting up...' : 'Enable 2FA'}
        </Button>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>
    );
  }

  if (step === 'qr') {
    return (
      <div>
        <p className="text-gray-600 mb-4">
          Scan this QR code with your authenticator app:
        </p>
        <div className="flex justify-center mb-4">
          {qrCode && (
            <Image
              src={qrCode}
              alt="2FA QR Code"
              width={200}
              height={200}
              className="border rounded"
            />
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Or enter this code manually: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
        </p>
        <Button onClick={() => setStep('verify')}>
          Continue
        </Button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div>
        <p className="text-gray-600 mb-4">
          Enter the 6-digit code from your authenticator app to verify:
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
          <Button onClick={verifyToken} disabled={isLoading || token.length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={() => setStep('qr')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Back to QR code
        </button>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div>
        <p className="text-gray-600 mb-4">
          Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code, i) => (
              <div key={i} className="p-2 bg-white rounded border">
                {code}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyBackupCodes}>
            Copy Codes
          </Button>
          <Button onClick={() => setStep('complete')}>
            I&apos;ve Saved My Codes
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="text-center">
        <div className="text-green-600 text-4xl mb-4">&#10003;</div>
        <h3 className="text-lg font-semibold mb-2">2FA Enabled!</h3>
        <p className="text-gray-600 mb-4">
          Your account is now protected with two-factor authentication.
        </p>
        <Button onClick={() => window.location.reload()}>
          Done
        </Button>
      </div>
    );
  }

  return null;
}
