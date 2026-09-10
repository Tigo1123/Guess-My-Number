import { useCallback, useEffect, useState } from 'react';

const isStandalone = () => typeof window !== 'undefined' && (
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
);

export function usePwaStatus() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [standalone, setStandalone] = useState(isStandalone);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine === false : false);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (event) => { event.preventDefault(); setDeferredPrompt(event); };
    const handleInstalled = () => { setDeferredPrompt(null); setStandalone(true); };
    const handleOffline = () => { setIsOffline(true); setShowBackOnline(false); };
    const handleOnline = () => { setIsOffline(false); setShowBackOnline(true); window.setTimeout(() => setShowBackOnline(false), 3000); };
    const media = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayMode = () => setStandalone(isStandalone());
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    media?.addEventListener?.('change', handleDisplayMode);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      media?.removeEventListener?.('change', handleDisplayMode);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
    setDeferredPrompt(null);
    return result.outcome === 'accepted';
  }, [deferredPrompt]);

  return { canInstall: Boolean(deferredPrompt) && !standalone, install, isOffline, showBackOnline, standalone };
}
