import React from 'react';

export function AttemptsRemainingDisplay({ attempts, maxAttempts, isLimitedMode }) {
  if (!isLimitedMode) return null;

  const remaining = Math.max(0, maxAttempts - attempts);

  return (
    <div className="attempts-remaining-container" aria-label="Attempts Remaining">
      <span className="attempts-label">ATTEMPTS REMAINING:</span>
      <span className={`attempts-value ${remaining <= 2 ? 'warning' : ''}`}>
        {remaining} / {maxAttempts}
      </span>
    </div>
  );
}
