import React from 'react';

export function RoundSummary({
  status,
  difficultyName,
  gameMode,
  score,
  attempts,
  secretNumber,
  timeRemaining,
  hintsUsed,
  unlockedThisRound = [],
  maxAttempts,
  isDailyChallengeActive,
  isPracticeReplay,
  todayKey,
}) {
  if (status !== 'WON' && status !== 'LOST') return null;

  const isWin = status === 'WON';
  const isTimedMode = gameMode === 'timed';
  const isLimitedMode = gameMode === 'limited';

  const modeLabel = isLimitedMode
    ? 'LIMITED ATTEMPTS'
    : isTimedMode
    ? 'TIMED CHALLENGE'
    : 'CLASSIC';

  return (
    <section className="round-summary" aria-label="Round Summary">
      <h2 className="summary-title">
        ROUND SUMMARY: {isWin ? 'VICTORY' : 'GAME OVER'}
      </h2>
      <div className="summary-grid">
        {isDailyChallengeActive && (
          <div className="summary-item full-width highlight">
            <span className="summary-label">DAILY CHALLENGE [{todayKey}]:</span>
            <span className="summary-value">
              {isPracticeReplay ? 'PRACTICE REPLAY' : 'OFFICIAL CHALLENGE'}
            </span>
          </div>
        )}
        <div className="summary-item">
          <span className="summary-label">GAME MODE:</span>
          <span className="summary-value">{modeLabel}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">RESULT:</span>
          <span className={`summary-value ${isWin ? 'win' : 'loss'}`}>
            {isWin ? 'WIN' : 'LOSS'}
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
          <span className="summary-label">HINTS USED:</span>
          <span className="summary-value">{hintsUsed}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">SECRET NUMBER:</span>
          <span className="summary-value">{secretNumber}</span>
        </div>

        {isTimedMode && (
          <div className="summary-item">
            <span className="summary-label">TIME METRIC:</span>
            <span className="summary-value">
              {timeRemaining === 0 ? 'TIME EXPIRED' : `${timeRemaining}s LEFT`}
            </span>
          </div>
        )}

        {isLimitedMode && (
          <div className="summary-item">
            <span className="summary-label">ATTEMPTS REMAINING:</span>
            <span className="summary-value">
              {attempts >= maxAttempts ? 'EXHAUSTED' : `${maxAttempts - attempts} / ${maxAttempts}`}
            </span>
          </div>
        )}

        {unlockedThisRound.length > 0 && (
          <div className="summary-item full-width">
            <span className="summary-label">ACHIEVEMENTS UNLOCKED:</span>
            <span className="summary-value win">
              {unlockedThisRound.join(', ')}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
