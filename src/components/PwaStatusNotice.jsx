import React from 'react';

export function PwaStatusNotice({ isOffline, showBackOnline }) {
  if (!isOffline && !showBackOnline) return null;
  return <div className={`pwa-status-notice ${isOffline ? 'offline' : 'online'}`} role="status" aria-live="polite">
    {isOffline ? "You're offline — local gameplay is still available." : 'Back online'}
  </div>;
}
