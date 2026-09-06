import React from 'react';

export function ProximityIndicator({ proximity }) {
  if (!proximity) return null;

  return (
    <div className="proximity-box" aria-live="polite">
      <span className={`proximity-text proximity-${proximity.toLowerCase().replace(' ', '-')}`}>
        Proximity: {proximity}
      </span>
    </div>
  );
}
