import React, { useMemo } from 'react';

export function PersonalRecords({
  statistics = {},
  streak = {},
  bestAttempts = {},
  achievements = [],
  dailyStreak = {},
  history = [],
}) {
  const analytics = useMemo(() => {
    const totalGames = statistics.totalGames || 0;
    const totalWins = statistics.totalWins || 0;
    const totalLosses = statistics.totalLosses || 0;
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
    const bestWinStreak = streak.bestStreak || 0;

    // Filter winning games from history
    const winningGames = history.filter((h) => h.result === 'WIN');

    // Records derived from history & state
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

    // Averages
    const avgAttemptsGame = history.length > 0
      ? (history.reduce((sum, h) => sum + h.attempts, 0) / history.length).toFixed(1)
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

    // Breakdown by Difficulty
    const getDiffWinRate = (diffKey) => {
      const diffData = (statistics.byDifficulty && statistics.byDifficulty[diffKey]) || { games: 0, wins: 0 };
      return diffData.games > 0 ? Math.round((diffData.wins / diffData.games) * 100) : 0;
    };

    const easyWinRate = getDiffWinRate('easy');
    const mediumWinRate = getDiffWinRate('medium');
    const hardWinRate = getDiffWinRate('hard');

    // Breakdown by Game Mode
    const getModeWinRate = (modeKey) => {
      const modeHistory = history.filter((h) => h.mode === modeKey);
      const wins = modeHistory.filter((h) => h.result === 'WIN').length;
      return modeHistory.length > 0 ? Math.round((wins / modeHistory.length) * 100) : 0;
    };

    const classicWinRate = getModeWinRate('classic');
    const timedWinRate = getModeWinRate('timed');
    const limitedWinRate = getModeWinRate('limited');

    // Daily Challenge Win Rate
    const dailyHistory = history.filter((h) => h.isDailyChallenge && h.dailyChallengeType === 'official');
    const dailyWins = dailyHistory.filter((h) => h.result === 'WIN').length;
    const dailyWinRate = dailyHistory.length > 0 ? Math.round((dailyWins / dailyHistory.length) * 100) : null;

    // Recent Form (Last 10 games, newest first)
    const recent10 = [...history].reverse().slice(0, 10);
    const recentWins = recent10.filter((h) => h.result === 'WIN').length;
    const recentLosses = recent10.length - recentWins;
    const recentWinRate = recent10.length > 0 ? Math.round((recentWins / recent10.length) * 100) : 0;
    const recentFormSeq = recent10.map((h) => (h.result === 'WIN' ? 'W' : 'L'));
    const recentAvgAttempts = recent10.length > 0
      ? (recent10.reduce((sum, h) => sum + h.attempts, 0) / recent10.length).toFixed(1)
      : null;
    const recentAvgHints = recent10.length > 0
      ? (recent10.reduce((sum, h) => sum + h.hintsUsed, 0) / recent10.length).toFixed(1)
      : null;

    return {
      totalGames,
      totalWins,
      totalLosses,
      winRate,
      bestWinStreak,
      highestScoreWin,
      fewestHintsWin,
      fastestTimedWinObj,
      avgAttemptsGame,
      avgAttemptsWin,
      avgScoreWin,
      avgHintsGame,
      easyWinRate,
      mediumWinRate,
      hardWinRate,
      classicWinRate,
      timedWinRate,
      limitedWinRate,
      dailyWinRate,
      recent10Count: recent10.length,
      recentWins,
      recentLosses,
      recentWinRate,
      recentFormSeq,
      recentAvgAttempts,
      recentAvgHints,
    };
  }, [statistics, streak, history]);

  const easyBestScore = statistics.highScores ? statistics.highScores.easy : 0;
  const mediumBestScore = statistics.highScores ? statistics.highScores.medium : 0;
  const hardBestScore = statistics.highScores ? statistics.highScores.hard : 0;

  return (
    <section className="records-dashboard-container" aria-label="Personal Records and Analytics Dashboard">
      <div className="records-header">
        <h2 className="records-title">PERSONAL RECORDS & ANALYTICS</h2>
      </div>

      {/* Highlights & Records Grid */}
      <div className="records-grid">
        <div className="record-card">
          <span className="record-label">HIGHEST SCORE WIN</span>
          <span className="record-value gold">
            {analytics.highestScoreWin !== null ? `${analytics.highestScoreWin}` : '—'}
          </span>
        </div>
        <div className="record-card">
          <span className="record-label">FASTEST TIMED WIN</span>
          <span className="record-value cyan">
            {analytics.fastestTimedWinObj ? `${analytics.fastestTimedWinObj.timeRemaining}s left` : '—'}
          </span>
        </div>
        <div className="record-card">
          <span className="record-label">FEWEST HINTS WIN</span>
          <span className="record-value green">
            {analytics.fewestHintsWin !== null ? `${analytics.fewestHintsWin} hints` : '—'}
          </span>
        </div>
        <div className="record-card">
          <span className="record-label">LONGEST DAILY STREAK</span>
          <span className="record-value orange">
            ⭐ {dailyStreak.best || 0}
          </span>
        </div>
      </div>

      {/* Averages Summary */}
      <div className="analytics-box">
        <h3 className="analytics-subtitle">PERFORMANCE AVERAGES</h3>
        <div className="averages-grid">
          <div className="avg-item">
            <span>Avg Attempts / Game:</span>
            <strong>{analytics.avgAttemptsGame !== null ? analytics.avgAttemptsGame : '—'}</strong>
          </div>
          <div className="avg-item">
            <span>Avg Attempts / Win:</span>
            <strong>{analytics.avgAttemptsWin !== null ? analytics.avgAttemptsWin : '—'}</strong>
          </div>
          <div className="avg-item">
            <span>Avg Score / Win:</span>
            <strong>{analytics.avgScoreWin !== null ? analytics.avgScoreWin : '—'}</strong>
          </div>
          <div className="avg-item">
            <span>Avg Hints / Game:</span>
            <strong>{analytics.avgHintsGame !== null ? analytics.avgHintsGame : '—'}</strong>
          </div>
          {analytics.dailyWinRate !== null && (
            <div className="avg-item">
              <span>Daily Challenge Win Rate:</span>
              <strong>{analytics.dailyWinRate}%</strong>
            </div>
          )}
        </div>
      </div>

      {/* Recent Form (Last 10 Games) */}
      <div className="analytics-box">
        <h3 className="analytics-subtitle">
          RECENT FORM ({analytics.recent10Count > 0 ? `LAST ${analytics.recent10Count} GAMES` : 'NO GAMES PLAYED'})
        </h3>
        {analytics.recent10Count > 0 ? (
          <div className="recent-form-content">
            <div className="form-record">
              <span>Record: <strong>{analytics.recentWins}W - {analytics.recentLosses}L</strong> ({analytics.recentWinRate}%)</span>
            </div>
            <div className="form-sequence" aria-label="Recent form sequence">
              <span className="form-seq-label">Sequence (Newest → Oldest):</span>
              <div className="form-badges">
                {analytics.recentFormSeq.map((res, i) => (
                  <span key={i} className={`form-badge ${res === 'W' ? 'win' : 'loss'}`}>
                    {res}
                  </span>
                ))}
              </div>
            </div>
            <div className="form-stats">
              <span>Recent Avg Attempts: <strong>{analytics.recentAvgAttempts}</strong></span> |{' '}
              <span>Recent Avg Hints: <strong>{analytics.recentAvgHints}</strong></span>
            </div>
          </div>
        ) : (
          <p className="no-data-text">Play completed games to generate recent form analytics.</p>
        )}
      </div>

      {/* Pure CSS Visual Analytics Bars */}
      <div className="analytics-box">
        <h3 className="analytics-subtitle">WIN RATE BREAKDOWN (VISUAL ANALYTICS)</h3>

        <div className="bars-section">
          <h4 className="bar-group-title">By Difficulty</h4>
          <div className="bar-item">
            <span className="bar-label">Easy ({analytics.easyWinRate}%)</span>
            <div className="bar-track" aria-label={`Easy difficulty win rate: ${analytics.easyWinRate}%`}>
              <div className="bar-fill easy" style={{ width: `${analytics.easyWinRate}%` }} />
            </div>
          </div>
          <div className="bar-item">
            <span className="bar-label">Medium ({analytics.mediumWinRate}%)</span>
            <div className="bar-track" aria-label={`Medium difficulty win rate: ${analytics.mediumWinRate}%`}>
              <div className="bar-fill medium" style={{ width: `${analytics.mediumWinRate}%` }} />
            </div>
          </div>
          <div className="bar-item">
            <span className="bar-label">Hard ({analytics.hardWinRate}%)</span>
            <div className="bar-track" aria-label={`Hard difficulty win rate: ${analytics.hardWinRate}%`}>
              <div className="bar-fill hard" style={{ width: `${analytics.hardWinRate}%` }} />
            </div>
          </div>
        </div>

        <div className="bars-section">
          <h4 className="bar-group-title">By Game Mode</h4>
          <div className="bar-item">
            <span className="bar-label">Classic ({analytics.classicWinRate}%)</span>
            <div className="bar-track" aria-label={`Classic game mode win rate: ${analytics.classicWinRate}%`}>
              <div className="bar-fill classic" style={{ width: `${analytics.classicWinRate}%` }} />
            </div>
          </div>
          <div className="bar-item">
            <span className="bar-label">Timed Challenge ({analytics.timedWinRate}%)</span>
            <div className="bar-track" aria-label={`Timed challenge mode win rate: ${analytics.timedWinRate}%`}>
              <div className="bar-fill timed" style={{ width: `${analytics.timedWinRate}%` }} />
            </div>
          </div>
          <div className="bar-item">
            <span className="bar-label">Limited Attempts ({analytics.limitedWinRate}%)</span>
            <div className="bar-track" aria-label={`Limited attempts mode win rate: ${analytics.limitedWinRate}%`}>
              <div className="bar-fill limited" style={{ width: `${analytics.limitedWinRate}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
