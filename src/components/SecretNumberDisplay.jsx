import React from 'react';

export function SecretNumberDisplay({ status, secretNumber }) {
  const isRevealed = status === 'WON' || status === 'LOST';

  return (
    <div className={`number ${isRevealed ? 'revealed' : ''}`}>
      {isRevealed ? secretNumber : '?'}
    </div>
  );
}
