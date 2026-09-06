import React from 'react';

export function GameStatistics({ statistics, onResetStatistics }) {
  const totalGames = statistics.totalGames || 0;
  const totalWins = statistics.totalWins || 0;
  const totalLosses = statistics.totalLosses || 0;
  const totalValidGuesses = statistics.totalValidGuesses || 0;

  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all lifetime statistics? High scores will not be affected.')) {
      onResetStatistics();
    }
  };

  return (
    <section className="statistics-container" aria-label="Lifetime Game Statistics">
      <h2 className="statistics-title">LIFETIME STATISTICS</h2>

      <div className="stats-overview-grid">
        <div className="stats-box">
          <div className="stats-label">GAMES PLAYED</div>
          <div className="stats-value">{totalGames}</div>
        </div>
        <div className="stats-box">
          <div className="stats-label">WINS</div>
          <div className="stats-value win">{totalWins}</div>
        </div>
        <div className="stats-box">
          <div className="stats-label">LOSSES</div>
          <div className="stats-value loss">{totalLosses}</div>
        </div>
        <div className="stats-box">
          <div className="stats-label">WIN RATE</div>
          <div className="stats-value">{winRate}%</div>
        </div>
        <div className="stats-box full-width">
          <div className="stats-label">TOTAL VALID GUESSES</div>
          <div className="stats-value">{totalValidGuesses}</div>
        </div>
      </div>

      <h3 className="stats-subtitle">DIFFICULTY BREAKDOWN</h3>
      <div className="stats-breakdown-grid">
        {['easy', 'medium', 'hard'].map((level) => {
          const diffStats = statistics.byDifficulty?.[level] || { games: 0, wins: 0, losses: 0 };
          return (
            <div key={level} className="stats-diff-card">
              <div className="diff-name">{level.toUpperCase()}</div>
              <div className="diff-metrics">
                <span>Games: <strong>{diffStats.games}</strong></span>
                <span>Wins: <strong className="win">{diffStats.wins}</strong></span>
                <span>Losses: <strong className="loss">{diffStats.losses}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="stats-actions">
        <button
          type="button"
          className="btn-reset-stats"
          onClick={handleReset}
          aria-label="Reset lifetime game statistics"
        >
          Reset Statistics
        </button>
      </div>
    </section>
  );
}
