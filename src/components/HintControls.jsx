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
    <section className="hint-controls-container" aria-label="Hint System">
      <div className="hint-controls">
        <button
          type="button"
          className="btn-hint btn-secondary"
          onClick={onGetHint}
          disabled={disabled || !canAffordHint}
          aria-label={`Get a hint (Cost: ${hintCost} score points)`}
        >
          Get hint (-{hintCost} pts)
        </button>
      </div>

      <span className="hints-used-badge text-sm">
        Hints used: <strong>{hintsUsed}</strong>
      </span>

      {currentHint && (
        <div className="hint-display" role="status" aria-live="polite">
          <span className="hint-text">Hint: {currentHint}</span>
        </div>
      )}
    </section>
  );
}
