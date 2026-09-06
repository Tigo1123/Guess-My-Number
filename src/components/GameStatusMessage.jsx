import React from 'react';

export function GameStatusMessage({ message, maxNumber }) {
  return (
    <>
      <p className="message">{message}</p>
      <p className="rang">Guess a Number between 1 and {maxNumber}</p>
    </>
  );
}
