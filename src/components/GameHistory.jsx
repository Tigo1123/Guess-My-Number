import React, { useState, useMemo } from 'react';
import { GameHistoryDetails } from './GameHistoryDetails';

export function GameHistory({ history = [], activeProfileName = 'Active Player', onClearHistory }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'win' | 'loss' | 'easy' | 'medium' | 'hard' | 'classic' | 'timed' | 'limited' | 'daily'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const filteredHistory = useMemo(() => {
    // Newest first
    const sorted = [...history].reverse();
    if (filter === 'all') return sorted;
    if (filter === 'win') return sorted.filter((h) => h.result === 'WIN');
    if (filter === 'loss') return sorted.filter((h) => h.result === 'LOSS');
    if (['easy', 'medium', 'hard'].includes(filter)) return sorted.filter((h) => h.difficulty === filter);
    if (['classic', 'timed', 'limited'].includes(filter)) return sorted.filter((h) => h.mode === filter);
    if (filter === 'daily') return sorted.filter((h) => h.isDailyChallenge);
    return sorted;
  }, [history, filter]);

  const handleOpenDetails = (entry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetails = () => {
    setSelectedEntry(null);
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setIsConfirmingClear(false);
  };

  return (
    <section className="history-section-container" aria-label="Game History Logs">
      <div className="history-section-header">
        <h2 className="history-section-title">GAME HISTORY ({activeProfileName})</h2>

        <button
          type="button"
          className="btn-clear-history danger"
          onClick={() => setIsConfirmingClear(true)}
          disabled={history.length === 0}
          aria-label={`Clear Game History for ${activeProfileName}`}
        >
          🗑️ Clear History
        </button>
      </div>

      <div className="history-filter-bar" role="group" aria-label="Game History Filter Category">
        {[
          { key: 'all', label: 'ALL' },
          { key: 'win', label: 'WINS' },
          { key: 'loss', label: 'LOSSES' },
          { key: 'easy', label: 'EASY' },
          { key: 'medium', label: 'MEDIUM' },
          { key: 'hard', label: 'HARD' },
          { key: 'classic', label: 'CLASSIC' },
          { key: 'timed', label: 'TIMED' },
          { key: 'limited', label: 'LIMITED' },
          { key: 'daily', label: 'DAILY' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            className={`tab-btn ${filter === item.key ? 'active' : ''}`}
            aria-pressed={filter === item.key}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isConfirmingClear && (
        <div className="history-confirm-modal" aria-label="Clear History Confirmation">
          <div className="confirm-box">
            <h3 className="confirm-title">CLEAR GAME HISTORY</h3>
            <p className="confirm-text">
              Clear game history for <strong>"{activeProfileName}"</strong>? Statistics and records stored elsewhere will not be reset.
            </p>
            <div className="confirm-actions">
              <button type="button" className="btn-danger-confirm" onClick={handleConfirmClear}>
                Confirm Clear
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsConfirmingClear(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="history-table-wrapper">
        {filteredHistory.length === 0 ? (
          <p className="no-history-text">No game history entries matching this filter.</p>
        ) : (
          <table className="history-table">
            <caption>Recent Completed Games Log</caption>
            <thead>
              <tr>
                <th scope="col">DATE / TIME</th>
                <th scope="col">RESULT</th>
                <th scope="col">DIFFICULTY</th>
                <th scope="col">MODE</th>
                <th scope="col">SCORE</th>
                <th scope="col">ATTEMPTS</th>
                <th scope="col">HINTS</th>
                <th scope="col">TYPE</th>
                <th scope="col">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((entry) => {
                const dateText = entry.playedAt ? new Date(entry.playedAt).toLocaleDateString() : '-';
                const isWin = entry.result === 'WIN';
                const typeText = entry.isDailyChallenge
                  ? entry.dailyChallengeType === 'official' ? '⭐ Daily' : '🎮 Practice'
                  : 'Normal';

                return (
                  <tr key={entry.id}>
                    <td className="date-cell">{dateText}</td>
                    <td className={`result-cell ${isWin ? 'win' : 'loss'}`}>
                      {isWin ? 'WIN 🎉' : 'LOSS 💀'}
                    </td>
                    <td className="diff-cell">{entry.difficulty.toUpperCase()}</td>
                    <td className="mode-cell">{entry.mode.toUpperCase()}</td>
                    <td className="score-cell">{entry.score}</td>
                    <td className="attempts-cell">{entry.attempts}</td>
                    <td className="hints-cell">{entry.hintsUsed}</td>
                    <td className="type-cell">{typeText}</td>
                    <td className="action-cell">
                      <button
                        type="button"
                        className="btn-view-details"
                        onClick={() => handleOpenDetails(entry)}
                        aria-label={`View details for game played on ${dateText}`}
                      >
                        🔍 Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <GameHistoryDetails entry={selectedEntry} onClose={handleCloseDetails} />
    </section>
  );
}
