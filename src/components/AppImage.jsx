import React, { useEffect, useState } from 'react';

/** Local image wrapper that hides broken optional artwork gracefully. */
export function AppImage({ src, alt = '', className = '', loading = 'lazy', fallbackSrc, decorative = false, ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setCurrentSrc(src); setFailed(false); }, [src]);
  if (failed || !currentSrc) return null;
  return (
    <img
      {...props}
      src={currentSrc}
      alt={decorative ? '' : alt}
      aria-hidden={decorative ? 'true' : undefined}
      className={className}
      loading={loading}
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        else setFailed(true);
      }}
    />
  );
}
