import React from 'react';

export function StreakDisplay({ currentStreak, bestStreak }) {
  return (
    <div className="streak-container" aria-label="Win Streak Tracker">
      <div className="streak-box">
        <span className="streak-label">CURRENT STREAK:</span>
        <span className="streak-value">{currentStreak}</span>
      </div>
      <div className="streak-box">
        <span className="streak-label">BEST STREAK:</span>
        <span className="streak-value">{bestStreak}</span>
      </div>
    </div>
  );
}
