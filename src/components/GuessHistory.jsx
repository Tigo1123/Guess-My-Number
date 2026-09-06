import React from 'react';

export function GuessHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="guess-history-container">
      <h3 className="history-title">GUESS HISTORY</h3>
      <ul className="history-list" aria-label="Previous valid guesses">
        {history.map((item, index) => (
          <li key={index} className="history-item">
            <span className="history-number">#{index + 1}: <strong>{item.guess}</strong></span>
            <span className={`history-result ${item.result.toLowerCase().replace(/\s+/g, '-')}`}>
              {item.result}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
