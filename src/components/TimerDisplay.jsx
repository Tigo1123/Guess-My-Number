import React from 'react';

export function TimerDisplay({ timeRemaining, isTimedMode }) {
  if (!isTimedMode) return null;

  const isCritical = timeRemaining <= 5;
  const isWarning = timeRemaining <= 10;

  return (
    <div className="timer-container" aria-label="Remaining Time">
      <span className="timer-label">TIME REMAINING:</span>
      <span
        className={`timer-value ${isCritical ? 'critical' : isWarning ? 'warning' : ''}`}
      >
        {timeRemaining}s
      </span>
    </div>
  );
}
