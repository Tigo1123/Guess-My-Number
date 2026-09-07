import React from 'react';

export function ActionControls({ onResetGame }) {
  return (
    <button type="button" className="again btn-secondary btn-play-again" onClick={() => onResetGame()}>
      New Round
    </button>
  );
}
