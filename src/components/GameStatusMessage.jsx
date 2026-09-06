import React from 'react';

export function GameStatusMessage({ message, maxNumber }) {
  return (
    <>
      <p className="message" role="status" aria-live="polite">
        {message}
      </p>
      <p className="rang">Guess a Number between 1 and {maxNumber}</p>
    </>
  );
}
