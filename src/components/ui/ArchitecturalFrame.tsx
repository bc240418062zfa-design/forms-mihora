import React, { useState } from 'react';

interface ArchitecturalFrameProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  children?: React.ReactNode;
}

/**
 * Gallery-grade architectural visual frame with warm stone fallback
 * if an image asset fails to load. Uses referrerPolicy="no-referrer".
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
      className={`relative overflow-hidden bg-[#EFECE6] border border-[#E4E2DA] ${className}`}
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
          className="w-full h-full bg-gradient-to-br from-[#F7F6F2] via-[#EFECE6] to-[#E2DFD7] flex items-center justify-center p-6"
        >
          <div className="w-16 h-16 border border-slate-300 rotate-45 flex items-center justify-center">
            <div className="w-6 h-6 border border-[#143A7B]/40" />
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
