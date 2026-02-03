'use client';

import { ReactNode } from 'react';

interface ShineEffectProps {
  children: ReactNode;
  className?: string;
}

export function ShineEffect({ children, className = '' }: ShineEffectProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {/* Shine overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'shine 0.8s ease-out',
        }}
      />
      <style jsx>{`
        @keyframes shine {
          from {
            background-position: 200% 0;
          }
          to {
            background-position: -200% 0;
          }
        }
        div:hover > div:last-child {
          animation: shine 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
