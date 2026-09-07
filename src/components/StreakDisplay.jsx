import React from 'react';

export function StreakDisplay({ currentStreak, bestStreak }) {
  return (
    <div className="streak-container metric-card" aria-label="Win Streak Tracker">
      <span className="metric-label">Streak</span>
      <span className="metric-value">{currentStreak} (Best: {bestStreak})</span>
    </div>
  );
}
