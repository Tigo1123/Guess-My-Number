import React, { useEffect, useRef, useState } from 'react';

export function ShareResultControls({ text }) {
  const [feedback, setFeedback] = useState('');
  const [pending, setPending] = useState(false);
  const active = useRef(true);
  const timer = useRef();
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; clearTimeout(timer.current); };
  }, []);

  async function perform(action) {
    setPending(true);
    setFeedback('');
    clearTimeout(timer.current);
    try {
      if (action === 'copy') {
        if (typeof navigator.clipboard?.writeText !== 'function') {
          if (active.current) setFeedback('Copy is unavailable in this browser.');
          return;
        }
        await navigator.clipboard.writeText(text);
        if (active.current) {
          setFeedback('Copied!');
          timer.current = setTimeout(() => setFeedback(''), 2500);
        }
      } else {
        await navigator.share({ title: 'Guess My Number', text });
      }
    } catch (error) {
      if (active.current && !(action === 'share' && error?.name === 'AbortError')) {
        setFeedback(action === 'copy' ? 'Could not copy. Please try again.' : 'Could not share. Try Copy Result.');
      }
    } finally {
      if (active.current) setPending(false);
    }
  }

  return (
    <div className="share-result">
      <div className="share-result-actions">
        <button type="button" className="btn-secondary" disabled={pending} onClick={() => perform('copy')}>
          {feedback === 'Copied!' ? 'Copied!' : 'Copy Result'}
        </button>
        {typeof navigator.share === 'function' && (
          <button type="button" className="btn-secondary" disabled={pending} onClick={() => perform('share')}>
            Share Result
          </button>
        )}
      </div>
      <p className="share-result-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
    </div>
  );
}
