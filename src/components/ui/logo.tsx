'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
    xl: { icon: 56, text: 'text-3xl' },
  };

  const iconSize = sizes[size].icon;

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo-round-128.png"
        alt="NotRenewing"
        width={iconSize}
        height={iconSize}
        className="rounded-full"
        priority
      />
      {showText && (
        <span className={`${sizes[size].text} font-bold text-gray-900 tracking-tight`}>
          Not<span className="text-primary-600">Renewing</span>
        </span>
      )}
    </div>
  );
}
