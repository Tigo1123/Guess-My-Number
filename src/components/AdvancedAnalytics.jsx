import React, { useMemo } from 'react';
import { analyticsLabels, calculatePlayerAnalytics, generatePlayerInsight } from '../utils/analytics';

export function AdvancedAnalytics({ history = [] }) {
  const analytics = useMemo(() => calculatePlayerAnalytics(history), [history]);
  const insight = generatePlayerInsight(analytics);
  return (
    <div className="advanced-analytics">
      <section className="summary-card-block" aria-label="Advanced Player Analytics">
        <h2 className="section-title">Advanced Analytics</h2>
        <div className="analytics-overview-grid">
          {[
            ['Average Attempts', analytics.averageAttempts ?? '—'],
            ['Best Difficulty', analytics.bestDifficulty ? analyticsLabels.difficulty[analytics.bestDifficulty] : '—'],
            ['Most Played Difficulty', analytics.mostPlayedDifficulty ? analyticsLabels.difficulty[analytics.mostPlayedDifficulty] : '—'],
            ['Most Played Game Mode', analytics.mostPlayedMode ? analyticsLabels.mode[analytics.mostPlayedMode] : '—'],
            ['Current Win Rate', analytics.winRate === null ? '—' : `${analytics.winRate}%`],
            ['Last 10 Games Win Rate', analytics.recentWinRate === null ? '—' : `${analytics.recentWinRate}%`],
            ['Current Streak', analytics.currentStreak],
            ['Best Streak', analytics.bestStreak],
          ].map(([label, value]) => <div className="metric-box" key={label}><span className="metric-box-label">{label}</span><span className="metric-box-value">{value}</span></div>)}
        </div>
        <p className="analytics-insight" role="status"><strong>Player insight:</strong> {insight}</p>
      </section>

      <section className="summary-card-block" aria-label="Recent Performance">
        <h2 className="section-title">Recent Performance</h2>
        {analytics.recent.length ? <div className="recent-performance-list">
          {analytics.recent.map((game) => <div className={`recent-performance-item ${game.outcome.toLowerCase()}`} key={`${game.id || game.index}-${game.index}`} aria-label={`Game ${game.index}: ${game.outcome}, ${analyticsLabels.difficulty[game.difficulty] || 'Unknown difficulty'}, ${game.attempts ?? 'unknown'} attempts`}>
            <span className="recent-game-number">Game {game.index}</span><span className="recent-result">{game.outcome}</span><span>{analyticsLabels.difficulty[game.difficulty] || 'Unknown'}</span><span>{game.attempts ?? '—'} attempts</span>
          </div>)}
        </div> : <p className="analytics-empty">Complete a game to see recent performance.</p>}
      </section>

      <section className="summary-card-block" aria-label="Difficulty Performance">
        <h2 className="section-title">Difficulty Performance</h2>
        <div className="analytics-table" role="table" aria-label="Difficulty performance">
          <div className="analytics-table-row analytics-table-head" role="row"><span>Difficulty</span><span>Games</span><span>Wins</span><span>Win Rate</span><span>Avg Attempts</span></div>
          {Object.entries(analyticsLabels.difficulty).map(([key, label]) => { const stat = analytics.difficultyStats[key]; return <div className="analytics-table-row" role="row" key={key}><span>{label}</span><span>{stat.games}</span><span>{stat.wins}</span><span>{stat.winRate === null ? '—' : `${stat.winRate}%`}</span><span>{stat.averageAttempts ?? '—'}</span></div>; })}
        </div>
      </section>

      <section className="summary-card-block" aria-label="Game Mode Performance">
        <h2 className="section-title">Game Mode Performance</h2>
        <div className="mode-analytics-grid">
          {Object.entries(analyticsLabels.mode).map(([key, label]) => { const stat = analytics.modeStats[key]; if (!stat.games) return null; return <div className="mode-analytics-card" key={key}><strong>{label}</strong><span>Games played: {stat.games}</span><span>Wins: {stat.wins}</span><span>Win rate: {stat.winRate}%</span></div>; })}
          {!Object.values(analytics.modeStats).some((stat) => stat.games) && <p className="analytics-empty">No completed game modes yet.</p>}
        </div>
      </section>
    </div>
  );
}
