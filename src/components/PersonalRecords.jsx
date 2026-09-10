import React, { useMemo } from 'react';

export function PersonalRecords({
  statistics = {},
  streak = {},
  bestAttempts = {},
  achievements = [],
  dailyStreak = {},
  history = [],
  bestEndlessStreak = 0,
}) {
  const analytics = useMemo(() => {
    const totalGames = statistics.totalGames || 0;
    const totalWins = statistics.totalWins || 0;

    const winningGames = history.filter((h) => h.result === 'WIN');

    const highestScoreWin = winningGames.length > 0
      ? Math.max(...winningGames.map((g) => g.score))
      : null;

    const fewestHintsWin = winningGames.length > 0
      ? Math.min(...winningGames.map((g) => g.hintsUsed))
      : null;

    const timedWins = winningGames.filter((g) => g.mode === 'timed' && typeof g.timeRemaining === 'number');
    const fastestTimedWinObj = timedWins.length > 0
      ? timedWins.reduce((best, cur) => (cur.timeRemaining > best.timeRemaining ? cur : best), timedWins[0])
      : null;

    const avgAttemptsWin = winningGames.length > 0
      ? (winningGames.reduce((sum, h) => sum + h.attempts, 0) / winningGames.length).toFixed(1)
      : null;

    const avgScoreWin = winningGames.length > 0
      ? (winningGames.reduce((sum, h) => sum + h.score, 0) / winningGames.length).toFixed(1)
      : null;

    const avgHintsGame = history.length > 0
      ? (history.reduce((sum, h) => sum + h.hintsUsed, 0) / history.length).toFixed(1)
      : null;

    const getDiffWinRate = (diffKey) => {
      const diffData = (statistics.byDifficulty && statistics.byDifficulty[diffKey]) || { games: 0, wins: 0 };
      return diffData.games > 0 ? Math.round((diffData.wins / diffData.games) * 100) : 0;
    };

    const easyWinRate = getDiffWinRate('easy');
    const mediumWinRate = getDiffWinRate('medium');
    const hardWinRate = getDiffWinRate('hard');

    const getModeWinRate = (modeKey) => {
      const modeHistory = history.filter((h) => h.mode === modeKey);
      const wins = modeHistory.filter((h) => h.result === 'WIN').length;
      return modeHistory.length > 0 ? Math.round((wins / modeHistory.length) * 100) : 0;
    };

    const classicWinRate = getModeWinRate('classic');
    const timedWinRate = getModeWinRate('timed');
    const limitedWinRate = getModeWinRate('limited');

    return {
      highestScoreWin,
      fewestHintsWin,
      fastestTimedWinObj,
      avgAttemptsWin,
      avgScoreWin,
      avgHintsGame,
      easyWinRate,
      mediumWinRate,
      hardWinRate,
      classicWinRate,
      timedWinRate,
      limitedWinRate,
    };
  }, [statistics, streak, history]);

  return (
    <div className="personal-records-section">
      {/* 4. PERSONAL RECORDS CARD */}
      <section className="summary-card-block" aria-label="Personal Records">
        <h2 className="section-title">Personal Records</h2>
        <div className="records-grid-3">
          <div className="metric-box">
            <span className="metric-box-label">Highest Score Win</span>
            <span className="metric-box-value accent-green">
              {analytics.highestScoreWin !== null ? analytics.highestScoreWin : '—'}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Best Endless Streak</span>
            <span className="metric-box-value accent-orange">{bestEndlessStreak}</span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Fastest Timed Win</span>
            <span className="metric-box-value accent-blue">
              {analytics.fastestTimedWinObj ? `${analytics.fastestTimedWinObj.timeRemaining}s left` : '—'}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Fewest Hints</span>
            <span className="metric-box-value">
              {analytics.fewestHintsWin !== null ? analytics.fewestHintsWin : '—'}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Longest Daily Streak</span>
            <span className="metric-box-value accent-orange">
              {dailyStreak.best || 0}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Avg Attempts / Win</span>
            <span className="metric-box-value">
              {analytics.avgAttemptsWin !== null ? analytics.avgAttemptsWin : '—'}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Avg Score / Win</span>
            <span className="metric-box-value">
              {analytics.avgScoreWin !== null ? analytics.avgScoreWin : '—'}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-box-label">Avg Hints / Game</span>
            <span className="metric-box-value">
              {analytics.avgHintsGame !== null ? analytics.avgHintsGame : '—'}
            </span>
          </div>
        </div>
      </section>

      {/* 5. PERFORMANCE ANALYTICS CARD */}
      <section className="summary-card-block" aria-label="Performance Analytics">
        <h2 className="section-title">Performance</h2>

        <div className="performance-grid">
          <div className="perf-subgroup">
            <h3 className="section-subtitle">By Difficulty</h3>
            <div className="progress-item">
              <div className="progress-header">
                <span>Easy</span>
                <strong>{analytics.easyWinRate}%</strong>
              </div>
              <div className="progress-track" aria-label={`Easy difficulty win rate: ${analytics.easyWinRate}%`}>
                <div className="progress-fill easy" style={{ width: `${analytics.easyWinRate}%` }} />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <span>Medium</span>
                <strong>{analytics.mediumWinRate}%</strong>
              </div>
              <div className="progress-track" aria-label={`Medium difficulty win rate: ${analytics.mediumWinRate}%`}>
                <div className="progress-fill medium" style={{ width: `${analytics.mediumWinRate}%` }} />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <span>Hard</span>
                <strong>{analytics.hardWinRate}%</strong>
              </div>
              <div className="progress-track" aria-label={`Hard difficulty win rate: ${analytics.hardWinRate}%`}>
                <div className="progress-fill hard" style={{ width: `${analytics.hardWinRate}%` }} />
              </div>
            </div>
          </div>

          <div className="perf-subgroup">
            <h3 className="section-subtitle">By Game Mode</h3>
            <div className="progress-item">
              <div className="progress-header">
                <span>Classic</span>
                <strong>{analytics.classicWinRate}%</strong>
              </div>
              <div className="progress-track" aria-label={`Classic game mode win rate: ${analytics.classicWinRate}%`}>
                <div className="progress-fill classic" style={{ width: `${analytics.classicWinRate}%` }} />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <span>Timed Challenge</span>
                <strong>{analytics.timedWinRate}%</strong>
              </div>
              <div className="progress-track" aria-label={`Timed challenge win rate: ${analytics.timedWinRate}%`}>
                <div className="progress-fill timed" style={{ width: `${analytics.timedWinRate}%` }} />
              </div>
            </div>

            <div className="progress-item">
              <div className="progress-header">
                <span>Limited Attempts</span>
                <strong>{analytics.limitedWinRate}%</strong>
              </div>
              <div className="progress-track" aria-label={`Limited attempts win rate: ${analytics.limitedWinRate}%`}>
                <div className="progress-fill limited" style={{ width: `${analytics.limitedWinRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
