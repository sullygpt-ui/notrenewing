'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
  };

  return (
    <div className="flex items-center gap-2">
      {/* Logo Icon - stylized "NR" in a rounded square */}
      <div className={`${sizes[size].icon} relative`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg transform rotate-3" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-black text-xs tracking-tighter" style={{ fontSize: size === 'sm' ? '10px' : size === 'md' ? '12px' : '14px' }}>
            NR
          </span>
        </div>
      </div>
      {showText && (
        <span className={`${sizes[size].text} font-bold text-gray-900`}>
          Not<span className="text-primary-600">Renewing</span>
        </span>
      )}
    </div>
  );
}
