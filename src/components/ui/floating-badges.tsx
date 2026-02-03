'use client';

import { motion } from 'framer-motion';

const floatingDomains = [
  { name: 'startup.io', x: '10%', y: '20%', delay: 0, duration: 8 },
  { name: 'cloud.ai', x: '85%', y: '15%', delay: 1, duration: 9 },
  { name: 'apex.co', x: '75%', y: '75%', delay: 2, duration: 7 },
  { name: 'nova.app', x: '15%', y: '70%', delay: 0.5, duration: 10 },
  { name: 'sync.dev', x: '60%', y: '25%', delay: 1.5, duration: 8.5 },
  { name: 'flow.net', x: '25%', y: '45%', delay: 2.5, duration: 9.5 },
  { name: 'pixel.org', x: '80%', y: '50%', delay: 0.8, duration: 7.5 },
];

export function FloatingBadges() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingDomains.map((domain, index) => (
        <motion.div
          key={domain.name}
          className="absolute"
          style={{ left: domain.x, top: domain.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.15, 0.3, 0.15],
            y: [0, -20, 0],
            scale: [0.9, 1, 0.9],
          }}
          transition={{
            duration: domain.duration,
            delay: domain.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="px-4 py-2 bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-full text-white/40 text-sm font-medium whitespace-nowrap">
            {domain.name}
          </div>
        </motion.div>
      ))}
      
      {/* Floating price tags */}
      <motion.div
        className="absolute"
        style={{ left: '45%', top: '80%' }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.1, 0.25, 0.1],
          y: [0, -15, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 6,
          delay: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-300/60 text-sm font-bold">
          $99
        </div>
      </motion.div>
      
      <motion.div
        className="absolute"
        style={{ left: '5%', top: '35%' }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          y: [0, -10, 0],
          rotate: [2, -2, 2],
        }}
        transition={{
          duration: 7,
          delay: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300/60 text-xs font-semibold">
          SOLD
        </div>
      </motion.div>
    </div>
  );
}
