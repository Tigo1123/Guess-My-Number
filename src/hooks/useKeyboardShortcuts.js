import { useEffect } from 'react';

const editable = (target) => {
  if (!target || typeof target.matches !== 'function') return false;
  return target.matches('input, textarea, select, [contenteditable="true"]');
};

export function useKeyboardShortcuts({ onSubmitGuess, onNewRound, onHint, onNavigate, onOpenHelp, onCloseHelp, helpOpen }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const key = event.key;
      if (key === 'Escape' && helpOpen) { event.preventDefault(); onCloseHelp(); return; }
      const isGuessInput = event.target?.matches?.('#guess-input');
      if (editable(event.target)) {
        if (key === 'Enter' && isGuessInput) { event.preventDefault(); onSubmitGuess(); }
        return;
      }
      if (key === '?') { event.preventDefault(); if (!helpOpen) onOpenHelp(); return; }
      if (key === 'r' || key === 'R') { event.preventDefault(); onNewRound(); return; }
      if (key === 'h' || key === 'H') { event.preventDefault(); onHint(); return; }
      if (/^[1-5]$/.test(key)) { event.preventDefault(); onNavigate(key); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [helpOpen, onCloseHelp, onHint, onNavigate, onNewRound, onOpenHelp, onSubmitGuess]);
}
