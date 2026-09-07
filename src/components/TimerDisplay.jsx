import React from 'react';

export function TimerDisplay({ timeRemaining, isTimedMode }) {
  if (!isTimedMode) return null;

  const isCritical = timeRemaining <= 5;
  const isWarning = timeRemaining <= 10;

  return (
    <div className="timer-container metric-card" aria-label="Remaining Time">
      <span className="metric-label">Time Remaining</span>
      <span
        className={`metric-value ${isCritical ? 'critical' : isWarning ? 'warning' : ''}`}
      >
        {timeRemaining}s
      </span>
    </div>
  );
}
