'use client';

import { useState } from 'react';
import { Button } from './button';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
        return;
      }

      setStatus('success');
      setMessage('You\'re subscribed! We\'ll send you our top picks.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="text-gray-600 mb-4 text-center">
        Get notified of our top picks directly to your inbox.
      </p>
      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-700 font-medium">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Button type="submit" isLoading={status === 'loading'}>
            Subscribe
          </Button>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-600 text-center">{message}</p>
      )}
    </div>
  );
}
