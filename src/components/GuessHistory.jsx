import React from 'react';

export function GuessHistory({ history }) {
  return (
    <section className="guess-history-container" aria-label="Guess History">
      <h2 className="history-title">GUESS HISTORY</h2>
      {!history || history.length === 0 ? (
        <p className="history-empty">No guesses yet.</p>
      ) : (
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
      )}
    </section>
  );
}
