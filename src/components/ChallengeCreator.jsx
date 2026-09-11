import React, { useState } from 'react';
import { createChallengeUrl, generateChallengeSeed } from '../utils/challenge';
import { AppImage } from './AppImage';
import { CHALLENGE_IMAGES } from '../utils/imageAssets';

export function ChallengeCreator({ difficulty }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const create = () => { const next = createChallengeUrl({ difficulty, seed: generateChallengeSeed() }); setUrl(next || ''); setFeedback(''); setOpen(true); };
  const copy = async () => { try { if (!navigator.clipboard?.writeText) throw new Error('unavailable'); await navigator.clipboard.writeText(url); setFeedback('Copied!'); } catch { setFeedback('Could not copy. Please copy the link manually.'); } };
  const share = async () => { try { await navigator.share({ title: 'Guess My Number — Friend Challenge', text: `Challenge you to Guess My Number (${difficulty[0].toUpperCase()}${difficulty.slice(1)})`, url }); } catch (error) { if (error?.name !== 'AbortError') setFeedback('Could not share. Try Copy Challenge Link.'); } };
  return <>
    <button type="button" className="btn-secondary challenge-create-button" onClick={create}>Challenge a Friend</button>
    {open && <div className="shortcut-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="shortcut-dialog challenge-dialog" role="dialog" aria-modal="true" aria-labelledby="challenge-create-title">
        <h2 id="challenge-create-title">Challenge a Friend</h2><AppImage src={CHALLENGE_IMAGES.friend} alt="Friend Challenge illustration" className="artwork-feature challenge-dialog-image" /><p className="setting-desc-text">Difficulty: <strong>{difficulty[0].toUpperCase() + difficulty.slice(1)}</strong></p>
        <label className="challenge-link-label" htmlFor="challenge-link">Challenge link</label><input id="challenge-link" className="challenge-link-input" readOnly value={url} />
        <div className="challenge-dialog-actions"><button type="button" className="btn-primary" onClick={copy}>Copy Challenge Link</button>{typeof navigator.share === 'function' && <button type="button" className="btn-secondary" onClick={share}>Share Challenge</button>}<button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Close</button></div>
        <p className="challenge-feedback" role="status" aria-live="polite">{feedback}</p>
      </section>
    </div>}
  </>;
}
