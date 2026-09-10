import React from 'react';

export function GameStatusMessage({ message, maxNumber, proximity, feedbackToken = 0 }) {
  const tooHigh = typeof message === 'string' && message.includes('Too High');
  const tooLow = typeof message === 'string' && message.includes('Too Low');
  const correct = typeof message === 'string' && message.toLowerCase().includes('correct');
  if (proximity && typeof proximity === 'object') {
    const high = proximity.direction === 'high';
    const almost = proximity.level === 'almost';
    const levelLabel = almost ? 'ALMOST!' : high ? 'TOO HIGH' : 'TOO LOW';
    const primaryIcon = almost ? '🔥' : high ? '⬆️' : '⬇️';
    const guidance = almost ? `Just a little too ${high ? 'high' : 'low'}` : high ? 'Try a lower number' : 'Try a higher number';
    const accessibleLabel = almost
      ? `Almost. Your guess is slightly too ${high ? 'high' : 'low'}.`
      : `Your guess is too ${high ? 'high' : 'low'}. ${guidance}.`;
    return <>
      <div className={`direction-feedback proximity-feedback proximity-${proximity.level} ${high ? 'too-high' : 'too-low'}`} key={`${proximity.level}-${proximity.direction}-${feedbackToken}`} role="status" aria-live="polite" aria-label={accessibleLabel}>
        <span className="direction-feedback-arrow" aria-hidden="true">{primaryIcon || (high ? '⬆️' : '⬇️')}</span>
        <span className="direction-feedback-copy"><strong>{levelLabel}</strong><span>{guidance} <b aria-hidden="true">{high ? '↑' : '↓'}</b></span></span>
      </div>
      <p className="rang">Guess a Number between 1 and {maxNumber}</p>
    </>;
  }
  if (correct) {
    return <><div className="correct-feedback" role="status" aria-live="polite"><span aria-hidden="true">🎯</span><strong>CORRECT!</strong><span className="correct-feedback-detail">Correct Number</span></div><p className="rang">Guess a Number between 1 and {maxNumber}</p></>;
  }
  if (tooHigh || tooLow) {
    const high = tooHigh;
    return <>
      <div className={`direction-feedback ${high ? 'too-high' : 'too-low'}`} key={`${message}-${feedbackToken}`} role="status" aria-live="polite">
        <span className="direction-feedback-arrow" aria-hidden="true">{high ? '⬆️' : '⬇️'}</span>
        <span className="direction-feedback-copy"><strong>{high ? 'TOO HIGH' : 'TOO LOW'}</strong><span>{high ? 'Try a lower number' : 'Try a higher number'}</span></span>
      </div>
      <p className="rang">Guess a Number between 1 and {maxNumber}</p>
    </>;
  }
  return (
    <>
      <p className="message" role="status" aria-live="polite">
        {message}
      </p>
      <p className="rang">Guess a Number between 1 and {maxNumber}</p>
    </>
  );
}
