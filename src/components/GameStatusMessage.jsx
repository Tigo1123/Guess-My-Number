import React from 'react';

export function GameStatusMessage({ message, maxNumber, feedbackToken = 0 }) {
  const tooHigh = typeof message === 'string' && message.includes('Too High');
  const tooLow = typeof message === 'string' && message.includes('Too Low');
  const correct = typeof message === 'string' && message.toLowerCase().includes('correct');
  if (tooHigh || tooLow) {
    const high = tooHigh;
    return <>
      <div className={`direction-feedback ${high ? 'too-high' : 'too-low'}`} key={`${message}-${feedbackToken}`} role="status" aria-live="polite">
        <span className="direction-feedback-arrow" aria-hidden="true">{high ? '⬆️' : '⬇️'}</span>
        <span className="direction-feedback-copy"><strong>{high ? 'TOO HIGH' : 'TOO LOW'}</strong><span>{high ? 'Try a smaller number' : 'Try a larger number'}</span></span>
      </div>
      <p className="rang">Guess a Number between 1 and {maxNumber}</p>
    </>;
  }
  if (correct) {
    return <><div className="correct-feedback" role="status" aria-live="polite"><span aria-hidden="true">🎯</span><strong>CORRECT!</strong><span className="correct-feedback-detail">Correct Number</span></div><p className="rang">Guess a Number between 1 and {maxNumber}</p></>;
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
