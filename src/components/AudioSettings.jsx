import React from 'react';

export function AudioSettings({ musicEnabled, musicVolume, onToggleMusic, onVolumeChange, soundEnabled, onToggleSound }) {
  return <section className="summary-card-block audio-settings" aria-label="Audio">
    <h2 className="section-title">Audio</h2>
    <div className="preference-setting-row"><div className="setting-info"><span className="setting-label-title">Background Music</span><p className="setting-desc-text">Play a subtle instrumental loop during the app.</p></div><button type="button" className={`btn-music-toggle ${musicEnabled ? 'on' : 'off'}`} aria-pressed={musicEnabled} aria-label={`Background Music ${musicEnabled ? 'On' : 'Off'}`} onClick={onToggleMusic}>{musicEnabled ? 'ON' : 'OFF'}</button></div>
    <label className="music-volume-control" htmlFor="music-volume"><span className="setting-label-title">Music Volume <output>{Math.round(musicVolume * 100)}%</output></span><input id="music-volume" type="range" min="0" max="100" step="1" value={Math.round(musicVolume * 100)} onChange={(event) => onVolumeChange(Number(event.target.value) / 100)} aria-label={`Music volume ${Math.round(musicVolume * 100)} percent`} /></label>
    <div className="preference-setting-row"><div className="setting-info"><span className="setting-label-title">Sound Effects</span><p className="setting-desc-text">Play gameplay feedback sounds.</p></div><button type="button" className={`btn-sound-toggle ${soundEnabled ? 'on' : 'off'}`} aria-pressed={soundEnabled} aria-label={`Sound Effects ${soundEnabled ? 'On' : 'Off'}`} onClick={onToggleSound}>{soundEnabled ? 'ON' : 'OFF'}</button></div>
  </section>;
}
