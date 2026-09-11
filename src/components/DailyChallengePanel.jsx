import React from 'react';
import { AppImage } from './AppImage';

export function DailyChallengePanel({
  todayKey,
  dailyChallengeConfig,
  isCompletedToday,
  todayResult,
  dailyStreak,
  isDailyChallengeActive,
  isPracticeReplay,
  onStartDailyChallenge,
  onStartPracticeReplay,
  onExitDailyChallenge,
  imageSrc,
}) {
  const { difficulty, mode } = dailyChallengeConfig;

  return (
    <section className="daily-panel-container" aria-label="Daily Challenge">
      <div className="daily-panel-header">
        <h2 className="daily-panel-title">DAILY CHALLENGE</h2>
        <span className="daily-date">{todayKey}</span>
      </div>
      {imageSrc && <AppImage src={imageSrc} alt="Daily Challenge illustration" className="artwork-feature challenge-panel-image" />}

      <div className="daily-panel-info">
        <div className="daily-info-item">
          <span>Target Difficulty:</span>
          <strong>{difficulty.toUpperCase()}</strong>
        </div>
        <div className="daily-info-item">
          <span>Target Mode:</span>
          <strong>{mode.toUpperCase()}</strong>
        </div>
        <div className="daily-info-item">
          <span>Daily Streak:</span>
          <strong className="streak-highlight">{dailyStreak.current} (Best: {dailyStreak.best})</strong>
        </div>
      </div>

      {isCompletedToday && todayResult && (
        <div className="daily-status-box completed">
          <span>Today's Challenge Completed</span>
          <div className="official-result-detail">
            Official Result: <strong>{todayResult.won ? 'WIN' : 'LOSS'}</strong> (Score: {todayResult.score}, Attempts: {todayResult.attempts})
          </div>
        </div>
      )}

      {isDailyChallengeActive && (
        <div className="daily-active-badge">
          {isPracticeReplay ? 'PRACTICE REPLAY ACTIVE' : 'OFFICIAL DAILY CHALLENGE ACTIVE'}
        </div>
      )}

      <div className="daily-panel-actions">
        {!isDailyChallengeActive ? (
          !isCompletedToday ? (
            <button
              type="button"
              className="btn-daily-action primary"
              onClick={onStartDailyChallenge}
              aria-label="Start Today's Daily Challenge"
            >
              Play Daily Challenge
            </button>
          ) : (
            <button
              type="button"
              className="btn-daily-action secondary"
              onClick={onStartPracticeReplay}
              aria-label="Start Practice Replay"
            >
              Practice Replay
            </button>
          )
        ) : (
          <button
            type="button"
            className="btn-daily-action exit"
            onClick={onExitDailyChallenge}
            aria-label="Exit Daily Challenge"
          >
            Exit Daily Challenge
          </button>
        )}
      </div>
    </section>
  );
}
