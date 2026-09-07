import React from 'react';

export function ModeSelector({ activeMode, onSelectMode, disabled }) {
  return (
    <section className="mode-selector" aria-label="Select Game Mode">
      <span className="selector-label">Game Mode</span>
      <div className="mode-buttons" role="group" aria-label="Game Modes">
        <button
          type="button"
          className={`mode-btn ${activeMode === 'classic' ? 'active' : ''}`}
          aria-pressed={activeMode === 'classic'}
          onClick={() => onSelectMode('classic')}
          disabled={disabled}
        >
          Classic Mode
        </button>
        <button
          type="button"
          className={`mode-btn ${activeMode === 'timed' ? 'active' : ''}`}
          aria-pressed={activeMode === 'timed'}
          onClick={() => onSelectMode('timed')}
          disabled={disabled}
        >
          Timed Challenge
        </button>
        <button
          type="button"
          className={`mode-btn ${activeMode === 'limited' ? 'active' : ''}`}
          aria-pressed={activeMode === 'limited'}
          onClick={() => onSelectMode('limited')}
          disabled={disabled}
        >
          Limited Attempts
        </button>
      </div>
    </section>
  );
}
