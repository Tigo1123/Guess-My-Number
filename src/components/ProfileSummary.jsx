import React from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';

export function ProfileSummary({
  activeProfile,
  statistics = {},
  streak = {},
  bestAttempts = {},
  achievements = [],
  dailyStreak = {},
}) {
  if (!activeProfile) return null;

  const totalGames = statistics.totalGames || 0;
  const totalWins = statistics.totalWins || 0;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const bestWinStreak = streak.bestStreak || 0;
  const achievementsCount = achievements ? achievements.length : 0;
  const totalAchievements = ACHIEVEMENTS.length;
  const currentDailyStreak = dailyStreak.current || 0;

  const easyBest = bestAttempts.easy !== null && bestAttempts.easy !== undefined ? `${bestAttempts.easy}` : '—';
  const mediumBest = bestAttempts.medium !== null && bestAttempts.medium !== undefined ? `${bestAttempts.medium}` : '—';
  const hardBest = bestAttempts.hard !== null && bestAttempts.hard !== undefined ? `${bestAttempts.hard}` : '—';

  return (
    <div className="player-summary-section">
      <section className="summary-card-block" aria-label="Player Summary">
        <h2 className="section-title">Player Summary ({activeProfile.name})</h2>
        <div className="metrics-grid-6">
          <div className="metric-box">
            <span className="metric-box-label">Total Games</span>
            <span className="metric-box-value">{totalGames}</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Wins</span>
            <span className="metric-box-value accent-green">{totalWins}</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Win Rate</span>
            <span className="metric-box-value">{winRate}%</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Best Streak</span>
            <span className="metric-box-value accent-orange">{bestWinStreak}</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Achievements</span>
            <span className="metric-box-value">{achievementsCount} / {totalAchievements}</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Daily Streak</span>
            <span className="metric-box-value accent-blue">{currentDailyStreak}</span>
          </div>
        </div>
      </section>

      <section className="summary-card-block" aria-label="Best Attempts">
        <h3 className="section-subtitle">Best Attempts</h3>
        <div className="best-attempts-grid">
          <div className="best-attempt-item">
            <span className="best-attempt-label">Easy</span>
            <span className="best-attempt-value">{easyBest}</span>
          </div>
          <div className="best-attempt-item">
            <span className="best-attempt-label">Medium</span>
            <span className="best-attempt-value">{mediumBest}</span>
          </div>
          <div className="best-attempt-item">
            <span className="best-attempt-label">Hard</span>
            <span className="best-attempt-value">{hardBest}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
