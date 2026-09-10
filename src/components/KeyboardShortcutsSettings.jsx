import React from 'react';

export function KeyboardShortcutsSettings({ onOpen }) {
  return <section className="summary-card-block keyboard-shortcuts-settings" aria-label="Keyboard Shortcuts">
    <div className="shortcut-settings-row"><div><h2 className="section-title">Keyboard Shortcuts</h2><p className="setting-desc-text">Use quick keys to navigate and play on desktop.</p></div><button type="button" className="btn-secondary" onClick={onOpen}>View shortcuts</button></div>
  </section>;
}
