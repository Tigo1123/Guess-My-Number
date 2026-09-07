import React from 'react';

export function ScoreBoard({ score, highScore, attempts }) {
  return (
    <section className="score-board metrics-grid" aria-label="Score Metrics">
      <div className="metric-card">
        <span className="metric-label">Score</span>
        <span className="metric-value accent">{score}</span>
      </div>

      <div className="metric-card">
        <span className="metric-label">Best</span>
        <span className="metric-value">{highScore}</span>
      </div>

      <div className="metric-card">
        <span className="metric-label">Attempts</span>
        <span className="metric-value">{attempts}</span>
      </div>
    </section>
  );
}
