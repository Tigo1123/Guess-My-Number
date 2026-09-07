import React from 'react';

export function GameStatistics({
  statistics = {},
  streak = {},
  bestAttempts = {},
  onResetStatistics,
}) {
  const totalGames = statistics.totalGames || 0;
  const totalWins = statistics.totalWins || 0;
  const totalLosses = statistics.totalLosses || 0;
  const totalValidGuesses = statistics.totalValidGuesses || 0;

  const formatBestAttempts = (val) => {
    if (val === null || val === undefined) return '—';
    return `${val} attempt${val > 1 ? 's' : ''}`;
  };

  return (
    <section className="summary-card-block" aria-label="Lifetime Game Statistics">
      <h2 className="section-title">Lifetime Statistics</h2>

      <div className="metrics-grid-4">
        <div className="metric-box">
          <span className="metric-box-label">Games Played</span>
          <span className="metric-box-value">{totalGames}</span>
        </div>
        <div className="metric-box">
          <span className="metric-box-label">Wins</span>
          <span className="metric-box-value accent-green">{totalWins}</span>
        </div>
        <div className="metric-box">
          <span className="metric-box-label">Losses</span>
          <span className="metric-box-value accent-red">{totalLosses}</span>
        </div>
        <div className="metric-box">
          <span className="metric-box-label">Valid Guesses</span>
          <span className="metric-box-value">{totalValidGuesses}</span>
        </div>
      </div>

      <div className="diff-breakdown-section">
        <h3 className="section-subtitle">Difficulty Breakdown</h3>
        <div className="stats-breakdown-grid">
          {['easy', 'medium', 'hard'].map((level) => {
            const diffStats = statistics.byDifficulty?.[level] || { games: 0, wins: 0, losses: 0 };
            const bestAtt = bestAttempts?.[level];
            return (
              <div key={level} className="stats-diff-card">
                <span className="diff-card-name">{level.toUpperCase()}</span>
                <div className="diff-card-metrics">
                  <span>Games: <strong>{diffStats.games}</strong></span>
                  <span>Wins: <strong className="accent-green">{diffStats.wins}</strong></span>
                  <span>Losses: <strong className="accent-red">{diffStats.losses}</strong></span>
                  <span>Best: <strong>{formatBestAttempts(bestAtt)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
