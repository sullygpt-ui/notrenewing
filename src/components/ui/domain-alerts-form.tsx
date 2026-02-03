'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Sparkles, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="relative bg-gradient-to-br from-[#0c0a1d] via-[#0f0d24] to-[#13102b] rounded-3xl p-10 text-center overflow-hidden shadow-2xl">
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-primary-600/20 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite_1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/10 rounded-full blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
      </div>
      
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none" />
      
      <div className="relative">
        {/* Animated icon */}
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-6 shadow-xl shadow-amber-500/30"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Bell className="w-8 h-8 text-white" />
        </motion.div>
        
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
          Get First Dibs on Premium Domains
        </h3>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
          Be the first to know when high-quality domains hit the marketplace. 
          Our AI scores every listing — you get alerts for the best ones.
        </p>
        
        {status === 'success' ? (
          <motion.div 
            className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-3 text-white font-medium">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg">{message}</span>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-sm bg-white/[0.08] border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-primary-500/50 backdrop-blur-xl transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                variant="secondary"
                size="lg"
                isLoading={status === 'loading'}
                className="px-6 py-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              No spam. Just alerts when exceptional domains are listed.
            </p>
          </form>
        )}
        {status === 'error' && (
          <motion.p 
            className="mt-4 text-sm text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}
