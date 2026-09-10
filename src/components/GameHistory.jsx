import React, { useState, useMemo } from 'react';
import { GameHistoryDetails } from './GameHistoryDetails';

export function GameHistory({ history = [], activeProfileName = 'Active Player', onClearHistory, onPlayRound }) {
  const [filter, setFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const filteredHistory = useMemo(() => {
    const sorted = [...history].reverse();
    if (filter === 'all') return sorted;
    if (filter === 'win') return sorted.filter((h) => h.result === 'WIN');
    if (filter === 'loss') return sorted.filter((h) => h.result === 'LOSS');
    if (['easy', 'medium', 'hard'].includes(filter)) return sorted.filter((h) => h.difficulty === filter);
    if (['classic', 'timed', 'limited'].includes(filter)) return sorted.filter((h) => h.mode === filter && !h.isFriendChallenge);
    if (filter === 'endless') return sorted.filter((h) => h.mode === 'endless');
    if (filter === 'friend') return sorted.filter((h) => h.isFriendChallenge);
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
    <section className="summary-card-block" aria-label="Game History Logs">
      <div className="section-header-row">
        <h2 className="section-title">Game History ({activeProfileName})</h2>

        <button
          type="button"
          className="btn-danger btn-sm"
          onClick={() => setIsConfirmingClear(true)}
          disabled={history.length === 0}
          aria-label={`Clear Game History for ${activeProfileName}`}
        >
          Clear History
        </button>
      </div>

      <div className="history-filter-bar" role="group" aria-label="Game History Filter Category">
        {[
          { key: 'all', label: 'All' },
          { key: 'win', label: 'Wins' },
          { key: 'loss', label: 'Losses' },
          { key: 'easy', label: 'Easy' },
          { key: 'medium', label: 'Medium' },
          { key: 'hard', label: 'Hard' },
          { key: 'classic', label: 'Classic' },
          { key: 'timed', label: 'Timed' },
          { key: 'limited', label: 'Limited' },
          { key: 'daily', label: 'Daily' },
          { key: 'friend', label: 'Friend Challenge' },
          { key: 'endless', label: 'Endless' },
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

      <div className="history-surface-container">
        {history.length === 0 ? (
          <div className="history-empty-card">
            <h3 className="empty-title">No games yet</h3>
            <p className="empty-desc">Complete your first round and your game history will appear here.</p>
            {onPlayRound && (
              <button type="button" className="btn-primary btn-play-round" onClick={onPlayRound}>
                Play a round
              </button>
            )}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="history-empty-card">
            <h3 className="empty-title">No matching entries</h3>
            <p className="empty-desc">No game history entries match the selected filter category.</p>
          </div>
        ) : (
          <div className="table-responsive">
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
                    ? entry.dailyChallengeType === 'official' ? 'Daily' : 'Practice'
                    : 'Normal';

                  return (
                    <tr key={entry.id}>
                      <td className="date-cell" data-label="DATE / TIME">{dateText}</td>
                      <td className={`result-cell ${isWin ? 'win' : 'loss'}`} data-label="RESULT">
                        {isWin ? 'WIN' : 'LOSS'}
                      </td>
                      <td className="diff-cell" data-label="DIFFICULTY">{entry.difficulty.toUpperCase()}</td>
                      <td className="mode-cell" data-label="MODE">{entry.isFriendChallenge ? 'FRIEND CHALLENGE' : entry.mode.toUpperCase()}</td>
                      <td className="score-cell" data-label="SCORE">{entry.score}</td>
                      <td className="attempts-cell" data-label="ATTEMPTS">{entry.attempts}</td>
                      <td className="hints-cell" data-label="HINTS">{entry.hintsUsed}</td>
                      <td className="type-cell" data-label="TYPE">{typeText}</td>
                      <td className="action-cell" data-label="ACTION">
                        <button
                          type="button"
                          className="btn-view-details"
                          onClick={() => handleOpenDetails(entry)}
                          aria-label={`View details for game played on ${dateText}`}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <GameHistoryDetails entry={selectedEntry} onClose={handleCloseDetails} />
    </section>
  );
}
