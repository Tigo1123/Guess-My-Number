import { useCallback, useEffect, useState } from 'react';
import { ACCENT_STORAGE_KEY, ACCENTS, applyThemePreferences, getSystemTheme, readAccentPreference, readThemePreference, THEME_STORAGE_KEY, THEMES } from '../utils/theme';

export function useTheme() {
  const [themePreference, setThemePreference] = useState(() => readThemePreference());
  const [accent, setAccent] = useState(() => readAccentPreference());
  const [effectiveTheme, setEffectiveTheme] = useState(() => applyThemePreferences(readThemePreference(), readAccentPreference()));

  useEffect(() => {
    applyThemePreferences(themePreference, accent);
    setEffectiveTheme(themePreference === 'system' ? getSystemTheme() : themePreference);
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  }, [themePreference, accent]);

  useEffect(() => {
    if (themePreference !== 'system' || typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => setEffectiveTheme(applyThemePreferences('system', accent));
    media.addEventListener?.('change', handleChange);
    media.addListener?.(handleChange);
    return () => { media.removeEventListener?.('change', handleChange); media.removeListener?.(handleChange); };
  }, [accent, themePreference]);

  const chooseTheme = useCallback((value) => { if (THEMES.includes(value)) setThemePreference(value); }, []);
  const chooseAccent = useCallback((value) => { if (ACCENTS.includes(value)) setAccent(value); }, []);
  return { themePreference, accent, effectiveTheme, chooseTheme, chooseAccent };
}
