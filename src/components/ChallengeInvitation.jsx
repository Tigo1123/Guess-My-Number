import React, { useEffect, useRef } from 'react';
import { AppImage } from './AppImage';
import { CHALLENGE_IMAGES } from '../utils/imageAssets';

export function ChallengeInvitation({ challenge, onAccept, onDismiss }) {
  const acceptRef = useRef(null);
  useEffect(() => { acceptRef.current?.focus(); }, []);
  const label = challenge.difficulty[0].toUpperCase() + challenge.difficulty.slice(1);
  return <div className="shortcut-backdrop" role="presentation"><section className="shortcut-dialog challenge-dialog" role="dialog" aria-modal="true" aria-labelledby="friend-challenge-title"><h2 id="friend-challenge-title">Friend Challenge</h2><AppImage src={CHALLENGE_IMAGES.friend} alt="Friend Challenge illustration" className="artwork-feature challenge-dialog-image" /><p>Someone challenged you to guess the number.</p><p className="challenge-difficulty">Difficulty: <strong>{label}</strong></p><div className="challenge-dialog-actions"><button ref={acceptRef} type="button" className="btn-primary" onClick={onAccept}>Accept Challenge</button><button type="button" className="btn-secondary" onClick={onDismiss}>Dismiss</button></div></section></div>;
}
