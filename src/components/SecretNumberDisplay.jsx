import React from 'react';
import { AppImage } from './AppImage';
import { STATE_IMAGES } from '../utils/imageAssets';

export function SecretNumberDisplay({ status, secretNumber }) {
  const isRevealed = status === 'WON' || status === 'LOST';
  const statusClass = status === 'WON' ? 'won' : status === 'LOST' ? 'lost' : 'playing';

  return (
    <div className={`secret-number-container ${statusClass}`}>
      {status === 'WON' && <AppImage src={STATE_IMAGES.win} alt="Celebration after a correct guess" className="result-card-background" loading="eager" />}
      {status === 'WON' && <div className="result-card-overlay" aria-hidden="true" />}
      <div className="result-card-content">
        {status === 'LOST' && <>
          <div className="feedback-artwork"><AppImage src={STATE_IMAGES.loss} alt="Game over" className="feedback-state-image" loading="eager" /></div>
          <div className="direction-feedback-copy"><strong>GAME OVER</strong><span>Every round is a fresh start</span></div>
        </>}
        <span className="secret-label">
          {status === 'WON' ? 'Secret number revealed' : status === 'LOST' ? 'Game over — secret number was' : 'Guess the number'}
        </span>
        <div className={`secret-circle ${isRevealed ? 'revealed' : ''}`}>
          {isRevealed ? secretNumber : '?'}
        </div>
      </div>
      {status === 'WON' && <div className="win-particles" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</div>}
    </div>
  );
}
