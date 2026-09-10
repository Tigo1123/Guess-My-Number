import React from 'react';

export function AttemptsRemainingDisplay({ attempts, maxAttempts, isLimitedMode, isEndlessMode }) {
  if (!isLimitedMode && !isEndlessMode) return null;

  const remaining = Math.max(0, maxAttempts - attempts);

  return (
    <div className="attempts-remaining-container metric-card" aria-label="Attempts Remaining">
      <span className="metric-label">Attempts Remaining</span>
      <span className={`metric-value ${remaining <= 2 ? 'warning' : ''}`}>
        {remaining} / {maxAttempts}
      </span>
    </div>
  );
}
