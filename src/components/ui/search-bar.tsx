'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search domains...',
  defaultValue = '',
  size = 'md',
  className,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push('/browse');
      }
    },
    [query, router]
  );

  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const buttonSizes = {
    sm: 'px-3 text-xs',
    md: 'px-4 text-sm',
    lg: 'px-5 text-sm',
  };

  return (
    <form onSubmit={handleSubmit} className={clsx('relative w-full', className)}>
      <div className="relative">
        <svg
          className={clsx(
            'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400',
            size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={clsx(
            'w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'pl-10 pr-20',
            sizes[size]
          )}
        />
        <button
          type="submit"
          className={clsx(
            'absolute right-1.5 top-1/2 -translate-y-1/2',
            'bg-primary-600 text-white rounded-md font-medium',
            'hover:bg-primary-700 transition-colors',
            'h-[calc(100%-0.5rem)]',
            buttonSizes[size]
          )}
        >
          Search
        </button>
      </div>
    </form>
  );
}
