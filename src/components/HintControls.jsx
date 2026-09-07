import React from 'react';

export function HintControls({
  currentHint,
  hintCost,
  hintsUsed,
  onGetHint,
  disabled,
  canAffordHint,
}) {
  return (
    <section className="hint-section" aria-label="Hint System">
      <div className="hint-controls">
        <button
          type="button"
          className="btn-hint"
          onClick={onGetHint}
          disabled={disabled || !canAffordHint}
          aria-label={`Get a hint (Cost: ${hintCost} score points)`}
        >
          💡 Get Hint [-{hintCost} PTS]
        </button>
        <span className="hints-used-badge">
          Hints Used: <strong>{hintsUsed}</strong>
        </span>
      </div>

      {currentHint && (
        <div className="hint-display" role="status" aria-live="polite">
          <span className="hint-icon">🔍</span>
          <span className="hint-text">HINT: {currentHint}</span>
        </div>
      )}
    </section>
  );
}
