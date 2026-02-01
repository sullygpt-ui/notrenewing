'use client';

import { Shield, Lock, CreditCard } from 'lucide-react';

export function PaymentBadges({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 ${className}`}>
      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
        <Lock className="w-3.5 h-3.5 text-green-600" />
        <span>SSL Secured</span>
      </div>
      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
        <span>Powered by Stripe</span>
      </div>
      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
        <Shield className="w-3.5 h-3.5 text-primary-600" />
        <span>Buyer Protection</span>
      </div>
    </div>
  );
}
