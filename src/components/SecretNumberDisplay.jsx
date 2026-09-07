import React from 'react';

export function SecretNumberDisplay({ status, secretNumber }) {
  const isRevealed = status === 'WON' || status === 'LOST';
  const statusClass = status === 'WON' ? 'won' : status === 'LOST' ? 'lost' : 'playing';

  return (
    <div className={`secret-number-container ${statusClass}`}>
      <span className="secret-label">
        {status === 'WON' ? 'Secret number revealed' : status === 'LOST' ? 'Game over — secret number was' : 'Guess the number'}
      </span>
      <div className={`secret-circle ${isRevealed ? 'revealed' : ''}`}>
        {isRevealed ? secretNumber : '?'}
      </div>
    </div>
  );
}
