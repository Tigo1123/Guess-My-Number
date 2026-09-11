import React from 'react';
import { AppImage } from './AppImage';
import { STATE_IMAGES } from '../utils/imageAssets';

export function SecretNumberDisplay({ status, secretNumber }) {
  const isRevealed = status === 'WON' || status === 'LOST';
  const statusClass = status === 'WON' ? 'won' : status === 'LOST' ? 'lost' : 'playing';
  const stateKey = status === 'WON' ? 'win' : status === 'LOST' ? 'loss' : 'thinking';
  const stateAlt = status === 'WON' ? 'Celebration after a correct guess' : status === 'LOST' ? 'Game over' : 'Thinking about the hidden number';

  return (
    <div className={`secret-number-container ${statusClass}`}>
      <AppImage src={STATE_IMAGES[stateKey]} alt={stateAlt} className="game-state-image" />
      <span className="secret-label">
        {status === 'WON' ? 'Secret number revealed' : status === 'LOST' ? 'Game over — secret number was' : 'Guess the number'}
      </span>
      <div className={`secret-circle ${isRevealed ? 'revealed' : ''}`}>
        {isRevealed ? secretNumber : '?'}
      </div>
      {status === 'WON' && <div className="win-particles" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>}
    </div>
  );
}
