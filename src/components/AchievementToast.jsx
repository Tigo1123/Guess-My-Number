import React from 'react';

export function AchievementToast({ toastMessage }) {
  if (!toastMessage) return null;

  return (
    <div 
      className="achievement-toast" 
      role="status" 
      aria-live="polite"
    >
      <span className="toast-badge">UNLOCKED</span>
      <span className="toast-text">Achievement Unlocked: <strong>{toastMessage}</strong></span>
    </div>
  );
}
