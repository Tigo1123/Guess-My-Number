import React from 'react';

export function ModeSelector({ activeMode, onSelectMode }) {
  return (
    <section className="mode-selector" aria-label="Select Game Mode">
      <div className="mode-buttons" role="group" aria-label="Game Modes">
        <button
          type="button"
          className={`mode-btn ${activeMode === 'classic' ? 'active' : ''}`}
          aria-pressed={activeMode === 'classic'}
          onClick={() => onSelectMode('classic')}
        >
          Classic Mode
        </button>
        <button
          type="button"
          className={`mode-btn ${activeMode === 'timed' ? 'active' : ''}`}
          aria-pressed={activeMode === 'timed'}
          onClick={() => onSelectMode('timed')}
        >
          Timed Challenge
        </button>
      </div>
    </section>
  );
}
