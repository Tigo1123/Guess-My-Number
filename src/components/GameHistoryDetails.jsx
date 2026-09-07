import React, { useEffect } from 'react';

export function GameHistoryDetails({ entry, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!entry) return null;

  const dateStr = entry.playedAt ? new Date(entry.playedAt).toLocaleString() : 'Unknown Date';
  const isWin = entry.result === 'WIN';

  const formatDistance = (guessVal, secretVal) => {
    const dist = Math.abs(guessVal - secretVal);
    if (guessVal === secretVal) return 'Correct';
    const direction = guessVal > secretVal ? 'Too High' : 'Too Low';
    return `${direction} (Distance from secret: ${dist})`;
  };

  return (
    <div className="history-details-modal" aria-label="Game Replay Details Modal">
      <div className="details-modal-box">
        <div className="details-modal-header">
          <h3 className="details-modal-title">
            GAME REPLAY ANALYSIS: <span className={isWin ? 'win-text' : 'loss-text'}>{entry.result}</span>
          </h3>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close details modal">
            ✕
          </button>
        </div>

        <div className="details-meta-grid">
          <div className="meta-item">
            <span>Date & Time:</span> <strong>{dateStr}</strong>
          </div>
          <div className="meta-item">
            <span>Difficulty:</span> <strong>{entry.difficulty.toUpperCase()}</strong>
          </div>
          <div className="meta-item">
            <span>Game Mode:</span> <strong>{entry.mode.toUpperCase()}</strong>
          </div>
          <div className="meta-item">
            <span>Secret Number:</span> <strong className="secret-highlight">{entry.secretNumber}</strong>
          </div>
          <div className="meta-item">
            <span>Final Score:</span> <strong>{entry.score}</strong>
          </div>
          <div className="meta-item">
            <span>Attempts Used:</span> <strong>{entry.attempts}</strong>
          </div>
          <div className="meta-item">
            <span>Hints Used:</span> <strong>{entry.hintsUsed}</strong>
          </div>
          {entry.isDailyChallenge && (
            <div className="meta-item full">
              <span>Daily Challenge:</span>{' '}
              <strong>
                {entry.dailyChallengeType === 'official' ? 'Official Challenge' : 'Practice Replay'} [{entry.dailyDateKey}]
              </strong>
            </div>
          )}
          {entry.mode === 'timed' && (
            <div className="meta-item">
              <span>Time Metric:</span>{' '}
              <strong>
                {entry.timeRemaining !== null ? `${entry.timeRemaining}s remaining` : 'Expired'} (Max: {entry.maxTime}s)
              </strong>
            </div>
          )}
          {entry.mode === 'limited' && (
            <div className="meta-item">
              <span>Attempts Remaining:</span>{' '}
              <strong>
                {entry.attemptsRemaining !== null ? `${entry.attemptsRemaining}` : '0'} (Max: {entry.maxAttempts})
              </strong>
            </div>
          )}
          {entry.achievementsUnlocked && entry.achievementsUnlocked.length > 0 && (
            <div className="meta-item full">
              <span>Achievements Unlocked:</span>{' '}
              <strong className="achieve-text">{entry.achievementsUnlocked.join(', ')}</strong>
            </div>
          )}
        </div>

        <div className="details-sequence-section">
          <h4 className="sequence-title">Guess Sequence Analysis</h4>
          {entry.validGuesses && entry.validGuesses.length > 0 ? (
            <ol className="guess-sequence-list">
              {entry.validGuesses.map((guessVal, index) => (
                <li key={index} className="sequence-item">
                  <span className="step-num">Guess #{index + 1}:</span>
                  <strong className="step-val">{guessVal}</strong>
                  <span className="step-analysis">{formatDistance(guessVal, entry.secretNumber)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="no-sequence-text">No guess history recorded for this round.</p>
          )}
        </div>

        <div className="details-modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
