'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './button';

export function DomainAlertsForm() {
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
        body: JSON.stringify({ email, source: 'domain_alerts' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
        return;
      }

      setStatus('success');
      setMessage('You\'re in! We\'ll alert you when top domains drop.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-full mb-4">
        <Bell className="w-7 h-7 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">
        Get First Dibs on Premium Domains
      </h3>
      <p className="text-primary-100 mb-6 max-w-md mx-auto">
        Be the first to know when high-quality domains hit the marketplace. 
        Our AI scores every listing — you get alerts for the best ones.
      </p>
      
      {status === 'success' ? (
        <div className="bg-white/10 backdrop-blur rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 text-white font-medium">
            <CheckCircle className="w-5 h-5 text-green-300" />
            {message}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            />
            <Button 
              type="submit" 
              variant="secondary"
              size="lg"
              isLoading={status === 'loading'}
              className="px-6"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Notify Me
            </Button>
          </div>
          <p className="text-primary-200 text-xs mt-3">
            No spam. Just alerts when exceptional domains are listed.
          </p>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-300">{message}</p>
      )}
    </div>
  );
}
