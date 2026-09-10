export const THEME_STORAGE_KEY = 'guess_my_number_theme';
export const ACCENT_STORAGE_KEY = 'guess_my_number_accent';
export const THEMES = ['dark', 'light', 'system'];
export const ACCENTS = ['green', 'blue', 'purple'];

export function getSystemTheme() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function readThemePreference(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  const stored = storage?.getItem(THEME_STORAGE_KEY);
  return THEMES.includes(stored) ? stored : 'dark';
}

export function readAccentPreference(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  const stored = storage?.getItem(ACCENT_STORAGE_KEY);
  return ACCENTS.includes(stored) ? stored : 'green';
}

export function applyThemePreferences(themePreference = 'dark', accent = 'green') {
  if (typeof document === 'undefined') return getSystemTheme();
  const preference = THEMES.includes(themePreference) ? themePreference : 'dark';
  const selectedAccent = ACCENTS.includes(accent) ? accent : 'green';
  const effectiveTheme = preference === 'system' ? getSystemTheme() : preference;
  document.documentElement.dataset.theme = effectiveTheme;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.accent = selectedAccent;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', effectiveTheme === 'light' ? '#eef1f5' : '#070a0f');
  return effectiveTheme;
}
