import React from 'react';

export function ActionControls({ onResetGame }) {
  return (
    <>
      <button type="button" className="again" onClick={() => onResetGame()}>
        Again
      </button>
      <p className="tip">TIP: Guess the hidden number.</p>
    </>
  );
}
