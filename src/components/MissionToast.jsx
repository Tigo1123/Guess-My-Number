import React, { useEffect, useState } from 'react';

export function MissionToast({ mission, onDismiss }) {
  const [visible, setVisible] = useState(Boolean(mission));
  useEffect(() => {
    setVisible(Boolean(mission));
    if (!mission) return undefined;
    const timer = window.setTimeout(() => { setVisible(false); onDismiss(); }, 3600);
    return () => window.clearTimeout(timer);
  }, [mission, onDismiss]);

  if (!mission || !visible) return null;
  return <div className="mission-toast" role="status" aria-live="polite">
    <span className="toast-badge">✓ COMPLETE</span>
    <span className="toast-text"><strong>Mission Complete</strong> {mission.title}</span>
  </div>;
}
