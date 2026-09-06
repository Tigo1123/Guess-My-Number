import React from 'react';

export function ScoreBoard({ score, highScore, attempts }) {
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

      <div className="score-box attempts-box">
        <div className="label">ATTEMPTS</div>
        <div className="value attempts">{attempts}</div>
      </div>
    </section>
  );
}
