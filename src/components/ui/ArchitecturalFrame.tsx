import React, { useState } from 'react';

interface ArchitecturalFrameProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
}

/**
 * High-craft studio architectural visual container with built-in dark Prussian fallback
 * if an image asset fails to load. Always uses referrerPolicy="no-referrer".
 */
export const ArchitecturalFrame: React.FC<ArchitecturalFrameProps> = ({
  src,
  alt,
  className = '',
  imgClassName = '',
  children,
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#0A1B2E] border border-[rgba(244,247,245,0.22)] ${className}`}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className={`w-full h-full object-cover block ${imgClassName}`}
        />
      ) : (
        <div
          aria-label={alt}
          className="w-full h-full bg-gradient-to-br from-[#0F2740] via-[#1B3A5C] to-[#0A1B2E] flex items-center justify-center p-6"
        >
          <div className="w-16 h-16 border border-[rgba(244,247,245,0.28)] rotate-45 flex items-center justify-center">
            <div className="w-6 h-6 border border-[rgba(244,247,245,0.5)]" />
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
