import React from 'react';
import { ACCENTS, THEMES } from '../utils/theme';

const themeLabels = { dark: 'Dark', light: 'Light', system: 'System' };
const accentLabels = { green: 'Green', blue: 'Blue', purple: 'Purple' };

export function ThemeControls({ themePreference, accent, onThemeChange, onAccentChange }) {
  return <section className="summary-card-block appearance-card" aria-label="Appearance">
    <h2 className="section-title">Appearance</h2>
    <div className="appearance-control-group" aria-labelledby="theme-choice-label">
      <span className="setting-label-title" id="theme-choice-label">Theme</span>
      <div className="appearance-options" role="group" aria-label="Theme">
        {THEMES.map((value) => <button key={value} type="button" className={`appearance-option ${themePreference === value ? 'selected' : ''}`} aria-pressed={themePreference === value} onClick={() => onThemeChange(value)}>{themeLabels[value]}</button>)}
      </div>
    </div>
    <div className="appearance-control-group" aria-labelledby="accent-choice-label">
      <span className="setting-label-title" id="accent-choice-label">Accent</span>
      <div className="appearance-options" role="group" aria-label="Accent">
        {ACCENTS.map((value) => <button key={value} type="button" className={`appearance-option accent-${value} ${accent === value ? 'selected' : ''}`} aria-pressed={accent === value} onClick={() => onAccentChange(value)}>{accentLabels[value]}</button>)}
      </div>
    </div>
  </section>;
}
