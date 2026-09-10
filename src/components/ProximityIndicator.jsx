import React from 'react';

export function ProximityIndicator({ proximity, animationToken = 0 }) {
  if (!proximity) return null;

  return (
    <div className="proximity-box" key={`${proximity}-${animationToken}`} aria-live="off">
      <span className={`proximity-text proximity-${proximity.toLowerCase().replace(' ', '-')}`}>
        Proximity: {proximity}
      </span>
    </div>
  );
}
