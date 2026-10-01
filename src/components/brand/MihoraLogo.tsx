import React, { useState } from 'react';
import { BRANDING } from '../../config/branding';

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
  const [imageError, setImageError] = useState(false);

  const heights = {
    sm: variant === 'full' ? 32 : 26,
    md: variant === 'full' ? 44 : 36,
    lg: variant === 'full' ? 60 : 50,
    xl: variant === 'full' ? 84 : 70,
  };

  const currentHeight = heights[size];

  // Try serving the official branding SVG asset first
  if (!imageError) {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <img
          src={BRANDING.logoSvgPath}
          alt={BRANDING.companyName}
          style={{ height: `${currentHeight}px`, width: 'auto' }}
          className="object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback vector matching mihora-tech-detailed.svg
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {variant !== 'wordmark' && (
        <svg
          viewBox="0 0 1000 1000"
          style={{ height: `${currentHeight}px`, width: `${currentHeight}px` }}
          className="shrink-0"
        >
          <polygon points="270,195 500,385 435,435 270,285" fill="#1877F2" />
          <polygon points="730,195 500,385 565,435 730,285" fill="#1877F2" />
          <polygon points="500,385 435,435 500,515 565,435" fill="#1877F2" />
          <polygon points="270,285 365,355 365,580 270,510" fill="#0A1C38" />
          <polygon points="365,355 435,435 500,515 365,445" fill="#0E2344" />
          <polygon points="730,285 635,355 635,580 730,510" fill="#0A1C38" />
          <polygon points="635,355 565,435 500,515 635,445" fill="#0E2344" />

          {/* Lines */}
          <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Nodes */}
          <g fill="#FFFFFF">
            <circle cx="335" cy="377" r="10" />
            <circle cx="400" cy="352" r="11" />
            <circle cx="440" cy="434" r="9" />
            <circle cx="497" cy="417" r="12" />
            <circle cx="585" cy="447" r="9.5" />
            <circle cx="597" cy="385" r="11" />
            <circle cx="651" cy="309" r="10.5" />
            <circle cx="687" cy="416" r="9" />
          </g>
        </svg>
      )}

      {variant !== 'mark' && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`font-black tracking-widest text-lg ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            MIORA
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-0.5 w-3 bg-[#1877F2] rounded-full" />
            <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#1877F2] uppercase">
              TECH
            </span>
            <span className="h-0.5 w-3 bg-[#1877F2] rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};
