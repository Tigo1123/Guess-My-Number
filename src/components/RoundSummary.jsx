import React from 'react';

export function RoundSummary({ status, difficultyName, score, attempts, secretNumber }) {
  if (status !== 'WON' && status !== 'LOST') return null;

  const isWin = status === 'WON';

  return (
    <section className="round-summary" aria-label="Round Summary">
      <h2 className="summary-title">
        ROUND SUMMARY: {isWin ? 'VICTORY' : 'GAME OVER'}
      </h2>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="summary-label">RESULT:</span>
          <span className={`summary-value ${isWin ? 'win' : 'loss'}`}>
            {isWin ? 'WIN 🎉' : 'LOSS 💀'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">DIFFICULTY:</span>
          <span className="summary-value">{difficultyName}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">FINAL SCORE:</span>
          <span className="summary-value">{score}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">ATTEMPTS:</span>
          <span className="summary-value">{attempts}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">SECRET NUMBER:</span>
          <span className="summary-value">{secretNumber}</span>
        </div>
      </div>
    </section>
  );
}
