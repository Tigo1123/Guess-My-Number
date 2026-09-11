import React, { useState, useMemo } from 'react';
import { AppImage } from './AppImage';
import { AVATAR_FALLBACK } from '../utils/imageAssets';

export function LocalLeaderboard({ profiles = [], activeProfileId }) {
  const [filter, setFilter] = useState('overall'); // 'overall' | 'easy' | 'medium' | 'hard'

  const leaderboardEntries = useMemo(() => {
    return profiles.map((p) => {
      const prog = p.progress || {};
      const stats = prog.statistics || {};
      const byDiff = stats.byDifficulty || {};
      const streak = prog.streak || {};
      const achievements = prog.achievements || [];

      let games = 0;
      let wins = 0;

      if (filter === 'overall') {
        games = stats.totalGames || 0;
        wins = stats.totalWins || 0;
      } else {
        const diffData = byDiff[filter] || {};
        games = diffData.games || 0;
        wins = diffData.wins || 0;
      }

      const winRateRatio = games > 0 ? wins / games : 0;
      const winRatePercent = Math.round(winRateRatio * 100);
      const bestStreak = streak.bestStreak || 0;
      const achievementCount = achievements.length;

      return {
        id: p.id,
        name: p.name,
        isActive: p.id === activeProfileId,
        wins,
        games,
        winRateRatio,
        winRatePercent,
        bestStreak,
        achievementCount,
      };
    }).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.winRateRatio !== a.winRateRatio) return b.winRateRatio - a.winRateRatio;
      if (b.bestStreak !== a.bestStreak) return b.bestStreak - a.bestStreak;
      if (b.games !== a.games) return b.games - a.games;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [profiles, activeProfileId, filter]);

  return (
    <section className="summary-card-block" aria-label="Local Player Leaderboard">
      <div className="section-header-row">
        <h2 className="section-title">Local Leaderboard</h2>

        <div className="leaderboard-filter-tabs" role="group" aria-label="Leaderboard Difficulty Filter">
          {['overall', 'easy', 'medium', 'hard'].map((f) => (
            <button
              key={f}
              type="button"
              className={`tab-btn ${filter === f ? 'active' : ''}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="leaderboard-table-wrapper table-responsive">
        <table className="leaderboard-table">
          <caption>Local Player Rankings ({filter.toUpperCase()})</caption>
          <thead>
            <tr>
              <th scope="col">RANK</th>
              <th scope="col">PLAYER</th>
              <th scope="col">WINS</th>
              <th scope="col">WIN RATE</th>
              <th scope="col">BEST STREAK</th>
              <th scope="col">GAMES</th>
              <th scope="col">ACHIEVEMENTS</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardEntries.map((entry, index) => (
              <tr
                key={entry.id}
                className={entry.isActive ? 'active-profile-row' : ''}
                aria-current={entry.isActive ? 'row' : undefined}
              >
                <td className="rank-cell" data-label="RANK">{index + 1}</td>
                <td className="player-cell" data-label="PLAYER">
                  <AppImage src={pAvatarForEntry(profiles, entry.id)} fallbackSrc={AVATAR_FALLBACK} alt={`${entry.name} avatar`} className="artwork-avatar leaderboard-avatar" />
                  <span className="player-name">{entry.name}</span>
                  {entry.isActive && <span className="active-badge" aria-label="Active Player">(Active)</span>}
                </td>
                <td className="wins-cell" data-label="WINS">{entry.wins}</td>
                <td className="winrate-cell" data-label="WIN RATE">{entry.winRatePercent}%</td>
                <td className="streak-cell" data-label="BEST STREAK">{entry.bestStreak}</td>
                <td className="games-cell" data-label="GAMES">{entry.games}</td>
                <td className="achievements-cell" data-label="ACHIEVEMENTS">{entry.achievementCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function pAvatarForEntry(profiles, id) {
  return profiles.find((profile) => profile.id === id)?.avatar || AVATAR_FALLBACK;
}
