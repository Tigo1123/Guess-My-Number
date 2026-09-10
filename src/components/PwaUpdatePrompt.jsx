import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  if (!needRefresh) return null;
  return <div className="pwa-update-notice" role="status" aria-live="polite"><span>New version available</span><button type="button" className="btn-secondary" onClick={() => updateServiceWorker(true)}>Update</button></div>;
}
