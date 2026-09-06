import React from 'react';

export function TimerDisplay({ timeRemaining, isTimedMode }) {
  if (!isTimedMode) return null;

  return (
    <div className="timer-container" aria-label="Remaining Time">
      <span className="timer-label">TIME REMAINING:</span>
      <span className={`timer-value ${timeRemaining <= 10 ? 'warning' : ''}`}>
        {timeRemaining}s
      </span>
    </div>
  );
}
