import React from 'react';

export function ScoreBoard({ score, highScore }) {
  return (
    <section className="score-board">
      <div className="score-box">
        <div className="label">SCORE</div>
        <div className="value score">{score}</div>
      </div>

      <div className="score-box">
        <div className="label">HIGHSCORE</div>
        <div className="value highscore">{highScore}</div>
      </div>
    </section>
  );
}
