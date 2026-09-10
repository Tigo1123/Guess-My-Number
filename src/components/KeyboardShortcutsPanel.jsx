import React, { useEffect, useRef } from 'react';

const shortcuts = [
  ['Enter', 'Submit guess'], ['R', 'New round'], ['H', 'Hint'], ['1', 'Play'], ['2', 'Stats'], ['3', 'History'], ['4', 'Players'], ['5', 'Settings'], ['?', 'Shortcut help'], ['Esc', 'Close help'],
];

export function KeyboardShortcutsPanel({ open, onClose }) {
  const closeRef = useRef(null);
  const previouslyFocused = useRef(null);
  useEffect(() => {
    if (open) { previouslyFocused.current = document.activeElement; closeRef.current?.focus(); }
    else if (previouslyFocused.current?.focus) previouslyFocused.current.focus();
  }, [open]);
  if (!open) return null;
  return <div className="shortcut-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-dialog-title">
      <div className="shortcut-dialog-header"><h2 id="shortcut-dialog-title">Keyboard Shortcuts</h2><button ref={closeRef} type="button" className="btn-close-modal" onClick={onClose} aria-label="Close keyboard shortcuts">×</button></div>
      <div className="shortcut-list">{shortcuts.map(([key, label]) => <div className="shortcut-row" key={key}><kbd>{key}</kbd><span>{label}</span></div>)}</div>
      <button type="button" className="btn-secondary shortcut-close-button" onClick={onClose}>Close</button>
    </section>
  </div>;
}
