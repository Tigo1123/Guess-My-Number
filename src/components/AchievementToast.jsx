import React, { useEffect, useState } from 'react';

export function AchievementToast({ toastMessage }) {
  const [queue, setQueue] = useState(() => (Array.isArray(toastMessage) ? toastMessage : toastMessage ? [toastMessage] : []));
  const visibleMessage = queue[0];
  useEffect(() => {
    const messages = Array.isArray(toastMessage) ? toastMessage : toastMessage ? [toastMessage] : [];
    setQueue(messages);
  }, [toastMessage]);
  useEffect(() => {
    if (!visibleMessage) return undefined;
    const timer = window.setTimeout(() => setQueue((items) => items.slice(1)), 3600);
    return () => window.clearTimeout(timer);
  }, [visibleMessage]);
  if (!visibleMessage) return null;

  return (
    <div 
      className="achievement-toast" 
      role="status" 
      aria-live="polite"
    >
      <span className="toast-badge">UNLOCKED</span>
      <span className="toast-text">Achievement Unlocked: <strong>{visibleMessage}</strong></span>
    </div>
  );
}
