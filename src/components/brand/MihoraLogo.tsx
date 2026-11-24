import React from 'react';

interface MihoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'wordmark';
  theme?: 'light' | 'dark';
  className?: string;
}

export const MihoraLogo: React.FC<MihoraLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'light',
  className = '',
}) => {
  const heights = {
    sm: variant === 'full' ? 28 : 24,
    md: variant === 'full' ? 34 : 30,
    lg: variant === 'full' ? 46 : 40,
    xl: variant === 'full' ? 60 : 52,
  };

  const currentHeight = heights[size];
  const isDarkSurface = theme === 'dark';

  const wingPrimary = isDarkSurface ? '#FFFFFF' : '#143A7B';
  const wingSecondary = isDarkSurface ? '#CBD5E1' : '#0F172A';
  const pillarFill = isDarkSurface ? '#334155' : '#1E293B';
  const lineStroke = isDarkSurface ? '#0F172A' : '#FFFFFF';
  const nodeFill = isDarkSurface ? '#E2E8F0' : '#F8FAFC';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {variant !== 'wordmark' && (
        <svg
          viewBox="220 175 560 430"
          style={{ height: `${currentHeight}px`, width: 'auto' }}
          className="shrink-0"
          aria-hidden="true"
        >
          <polygon points="270,195 500,385 435,435 270,285" fill={wingPrimary} />
          <polygon points="730,195 500,385 565,435 730,285" fill={wingPrimary} />
          <polygon points="500,385 435,435 500,515 565,435" fill={wingSecondary} />
          <polygon points="270,285 365,355 365,580 270,510" fill={pillarFill} />
          <polygon points="365,355 435,435 500,515 365,445" fill={wingSecondary} />
          <polygon points="730,285 635,355 635,580 730,510" fill={pillarFill} />
          <polygon points="635,355 565,435 500,515 635,445" fill={wingSecondary} />
          <g stroke={lineStroke} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.88">
            <line x1="335" y1="377" x2="400" y2="352" />
            <line x1="335" y1="377" x2="440" y2="434" />
            <line x1="400" y1="352" x2="440" y2="434" />
            <line x1="400" y1="352" x2="497" y2="417" />
            <line x1="440" y1="434" x2="497" y2="417" />
            <line x1="497" y1="417" x2="597" y2="385" />
            <line x1="497" y1="417" x2="651" y2="309" />
            <line x1="497" y1="417" x2="585" y2="447" />
            <line x1="585" y1="447" x2="597" y2="385" />
            <line x1="597" y1="385" x2="651" y2="309" />
            <line x1="597" y1="385" x2="687" y2="416" />
            <line x1="651" y1="309" x2="687" y2="416" />
          </g>
          <g fill={nodeFill}>
            <circle cx="335" cy="377" r="9" />
            <circle cx="400" cy="352" r="10" />
            <circle cx="440" cy="434" r="8" />
            <circle cx="497" cy="417" r="11" />
            <circle cx="585" cy="447" r="8.5" />
            <circle cx="597" cy="385" r="10" />
            <circle cx="651" cy="309" r="9.5" />
            <circle cx="687" cy="416" r="8" />
          </g>
        </svg>
      )}

      {variant !== 'mark' && (
        <span className="flex flex-col justify-center leading-none text-left">
          <span
            className={`font-display font-extrabold tracking-[0.08em] text-base ${
              isDarkSurface ? 'text-white' : 'text-slate-900'
            }`}
          >
            MIHORA
          </span>
          <span
            className={`text-[10px] font-semibold tracking-[0.2em] mt-0.5 ${
              isDarkSurface ? 'text-slate-300' : 'text-[#143A7B]'
            }`}
          >
            TECH CAREERS
          </span>
        </span>
      )}
    </span>
  );
};
