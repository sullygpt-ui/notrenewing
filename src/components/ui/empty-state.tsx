'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Inbox, Search, Bell, ArrowRight } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  variant?: 'no-domains' | 'no-results' | 'no-watchlist';
  title?: string;
  description?: string;
  showCTA?: boolean;
}

const variants = {
  'no-domains': {
    icon: Inbox,
    title: 'Fresh Inventory Coming Soon',
    description: 'Our marketplace is curated — we only list quality domains. Sign up for alerts to be the first to know when new domains drop.',
    cta: { text: 'Get Domain Alerts', href: '#alerts' },
    gradient: 'from-primary-500 to-violet-500',
  },
  'no-results': {
    icon: Search,
    title: 'No Matching Domains',
    description: 'Try adjusting your filters or search terms. New domains are added regularly.',
    cta: { text: 'Clear Filters', href: '/browse' },
    gradient: 'from-amber-500 to-orange-500',
  },
  'no-watchlist': {
    icon: Bell,
    title: 'Your Watchlist is Empty',
    description: 'Save domains you\'re interested in and we\'ll notify you if they\'re about to expire.',
    cta: { text: 'Browse Domains', href: '/browse' },
    gradient: 'from-emerald-500 to-teal-500',
  },
};

export function EmptyState({ variant = 'no-domains', title, description, showCTA = true }: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div 
      className="text-center py-16 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated icon container */}
      <motion.div 
        className="relative mx-auto mb-8 w-24 h-24"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-3xl blur-xl opacity-20`} />
        
        {/* Icon container */}
        <div className={`relative w-full h-full bg-gradient-to-br ${config.gradient} rounded-3xl flex items-center justify-center shadow-xl`}>
          <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
        </div>
        
        {/* Floating dots */}
        <motion.div 
          className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full shadow-lg"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute -bottom-1 -left-3 w-3 h-3 bg-primary-400 rounded-full shadow-lg"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </motion.div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
        {title || config.title}
      </h3>
      
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        {description || config.description}
      </p>

      {showCTA && (
        <Link href={config.cta.href}>
          <Button variant="primary" size="lg" className="group">
            {config.cta.text}
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}

      {/* Decorative elements */}
      <div className="mt-12 flex justify-center gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-gray-200"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
