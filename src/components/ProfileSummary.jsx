import React from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';

export function ProfileSummary({
  activeProfile,
  statistics,
  streak,
  bestAttempts,
  achievements,
  dailyStreak,
}) {
  if (!activeProfile) return null;

  const totalGames = statistics.totalGames || 0;
  const totalWins = statistics.totalWins || 0;
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  const bestWinStreak = streak.bestStreak || 0;
  const achievementsCount = achievements ? achievements.length : 0;
  const totalAchievements = ACHIEVEMENTS.length;
  const currentDailyStreak = dailyStreak.current || 0;

  const easyBest = bestAttempts.easy !== null ? `${bestAttempts.easy}` : '-';
  const mediumBest = bestAttempts.medium !== null ? `${bestAttempts.medium}` : '-';
  const hardBest = bestAttempts.hard !== null ? `${bestAttempts.hard}` : '-';

  return (
    <section className="profile-summary-container" aria-label="Player Profile Summary">
      <div className="profile-summary-header">
        <h2 className="profile-summary-title">PLAYER SUMMARY: {activeProfile.name}</h2>
      </div>

      <div className="profile-summary-grid">
        <div className="summary-card">
          <span className="card-label">TOTAL GAMES</span>
          <span className="card-value">{totalGames}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">WINS</span>
          <span className="card-value win">{totalWins}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">WIN RATE</span>
          <span className="card-value">{winRate}%</span>
        </div>
        <div className="summary-card">
          <span className="card-label">BEST STREAK</span>
          <span className="card-value streak">🔥 {bestWinStreak}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">ACHIEVEMENTS</span>
          <span className="card-value">🏆 {achievementsCount} / {totalAchievements}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">DAILY STREAK</span>
          <span className="card-value daily">⭐ {currentDailyStreak}</span>
        </div>
        <div className="summary-card full-width">
          <span className="card-label">BEST ATTEMPTS (EASY / MEDIUM / HARD)</span>
          <span className="card-value attempts-trio">
            Easy: <strong>{easyBest}</strong> | Medium: <strong>{mediumBest}</strong> | Hard: <strong>{hardBest}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
