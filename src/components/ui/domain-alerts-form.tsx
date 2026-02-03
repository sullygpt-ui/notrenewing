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
    <div className="relative bg-[#0a0a1a] rounded-2xl p-8 text-center overflow-hidden">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.4] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-purple-600/25 rounded-full blur-[80px] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-teal-500/20 rounded-full blur-[100px] animate-[pulse_12s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/15 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      </div>
      
      <div className="relative">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-4">
          <Bell className="w-7 h-7 text-yellow-400" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          Get First Dibs on Premium Domains
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Be the first to know when high-quality domains hit the marketplace. 
          Our AI scores every listing — you get alerts for the best ones.
        </p>
        
        {status === 'success' ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-white font-medium">
              <CheckCircle className="w-5 h-5 text-green-400" />
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
                className="flex-1 px-4 py-3 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent backdrop-blur-xl"
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
            <p className="text-gray-500 text-xs mt-3">
              No spam. Just alerts when exceptional domains are listed.
            </p>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm text-red-400">{message}</p>
        )}
      </div>
    </div>
  );
}
