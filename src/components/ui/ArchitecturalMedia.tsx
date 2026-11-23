import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface ArchitecturalMediaProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackTitle?: string;
  children?: React.ReactNode;
}

export const ArchitecturalMedia: React.FC<ArchitecturalMediaProps> = ({
  src,
  alt,
  className = '',
  imgClassName = 'w-full h-full object-cover',
  fallbackTitle = 'MIHORA Engineering',
  children,
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[var(--surface-ink)] ${className}`}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={imgClassName}
        />
      ) : (
        <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0B1324] via-[#13223F] to-[#0B1324] text-slate-300">
          <Layers className="w-8 h-8 text-blue-400 mb-2 opacity-80" />
          <span className="font-display text-sm font-semibold tracking-tight text-white">
            {fallbackTitle}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};
