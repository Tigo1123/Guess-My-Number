import React from 'react';

export function InstallAppControl({ canInstall, onInstall }) {
  if (!canInstall) return null;
  return <div className="install-app-control"><div><span className="setting-label-title">Install Guess My Number</span><p className="setting-desc-text">Add the game to your device for quick offline access.</p></div><button type="button" className="btn-secondary" onClick={onInstall}>Install app</button></div>;
}
