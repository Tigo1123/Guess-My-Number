import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, act } from '@testing-library/react';
import { App } from '../App';
import { ThemeControls } from '../components/ThemeControls';
import { applyThemePreferences, ACCENT_STORAGE_KEY, THEME_STORAGE_KEY } from '../utils/theme';

let mediaMatches = false;
let mediaListeners = [];
function mockMedia() {
  mediaListeners = [];
  vi.stubGlobal('matchMedia', (query) => ({ matches: query.includes('prefers-color-scheme') ? mediaMatches : false, media: query, addEventListener: (_, cb) => mediaListeners.push(cb), removeEventListener: (_, cb) => { mediaListeners = mediaListeners.filter((item) => item !== cb); }, addListener: (cb) => mediaListeners.push(cb), removeListener: (cb) => { mediaListeners = mediaListeners.filter((item) => item !== cb); } }));
}
function openSettings() { fireEvent.click(screen.getByRole('tab', { name: 'Settings' })); }

describe('Phase 17 theme and personalization', () => {
  beforeEach(() => { localStorage.clear(); document.documentElement.removeAttribute('data-theme'); document.documentElement.removeAttribute('data-theme-preference'); document.documentElement.removeAttribute('data-accent'); mediaMatches = false; mockMedia(); });

  it('defaults to Dark without a stored preference', () => { render(<App />); expect(document.documentElement.dataset.theme).toBe('dark'); expect(document.documentElement.dataset.themePreference).toBe('dark'); });
  it.each(['dark', 'light', 'system'])('restores stored %s theme', (value) => { localStorage.setItem(THEME_STORAGE_KEY, value); render(<App />); expect(document.documentElement.dataset.themePreference).toBe(value); });
  it('stored Light applies light effective theme', () => { localStorage.setItem(THEME_STORAGE_KEY, 'light'); render(<App />); expect(document.documentElement.dataset.theme).toBe('light'); });
  it('stored System follows the OS preference', () => { mediaMatches = true; localStorage.setItem(THEME_STORAGE_KEY, 'system'); render(<App />); expect(document.documentElement.dataset.theme).toBe('light'); });
  it('System reacts when the OS theme changes', () => { localStorage.setItem(THEME_STORAGE_KEY, 'system'); render(<App />); expect(document.documentElement.dataset.theme).toBe('dark'); act(() => { mediaMatches = true; mediaListeners.forEach((listener) => listener({ matches: true })); }); expect(document.documentElement.dataset.theme).toBe('light'); });
  it('persists Dark, Light, and System selections', () => { render(<App />); openSettings(); fireEvent.click(screen.getByRole('button', { name: /^Light/ })); expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light'); fireEvent.click(screen.getByRole('button', { name: /^System/ })); expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system'); fireEvent.click(screen.getByRole('button', { name: /^Dark/ })); expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark'); });
  it.each(['green', 'blue', 'purple'])('persists %s accent and updates document', (accent) => { render(<App />); openSettings(); fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${accent}`, 'i') })); expect(localStorage.getItem(ACCENT_STORAGE_KEY)).toBe(accent); expect(document.documentElement.dataset.accent).toBe(accent); });
  it('applies document theme and accent attributes deterministically', () => { applyThemePreferences('light', 'purple'); expect(document.documentElement).toHaveAttribute('data-theme', 'light'); expect(document.documentElement).toHaveAttribute('data-theme-preference', 'light'); expect(document.documentElement).toHaveAttribute('data-accent', 'purple'); });
  it('keeps game data intact while saving appearance preferences', () => { const data = JSON.stringify({ profiles: [{ id: 'saved', name: 'Saved player' }] }); localStorage.setItem('guess_my_number_profiles', data); render(<App />); openSettings(); fireEvent.click(screen.getByRole('button', { name: /^Blue/ })); expect(localStorage.getItem('guess_my_number_profiles')).toContain('Saved player'); expect(localStorage.getItem(ACCENT_STORAGE_KEY)).toBe('blue'); });
  it('renders Appearance controls with programmatic selected state', () => { render(<App />); openSettings(); expect(screen.getByRole('region', { name: 'Appearance' })).toBeInTheDocument(); expect(screen.getByRole('button', { name: /^Dark/ })).toHaveAttribute('aria-pressed', 'true'); expect(screen.getByRole('button', { name: /^Green/ })).toHaveAttribute('aria-pressed', 'true'); });
  it('updates selected theme state accessibly', () => { render(<App />); openSettings(); const light = screen.getByRole('button', { name: /^Light/ }); fireEvent.click(light); expect(light).toHaveAttribute('aria-pressed', 'true'); expect(screen.getByRole('button', { name: /^Dark/ })).toHaveAttribute('aria-pressed', 'false'); });
  it('updates selected accent state accessibly', () => { render(<App />); openSettings(); const purple = screen.getByRole('button', { name: /^Purple/ }); fireEvent.click(purple); expect(purple).toHaveAttribute('aria-pressed', 'true'); });
  it('does not crash without matchMedia', () => { vi.stubGlobal('matchMedia', undefined); expect(() => render(<App />)).not.toThrow(); });
  it('supports the standalone PWA controls in Settings', () => { render(<App />); openSettings(); expect(screen.getByRole('region', { name: 'Install Application' })).toBeInTheDocument(); expect(screen.getByText('About')).toBeInTheDocument(); });
  it('keeps core gameplay rendered after theme changes', () => { render(<App />); openSettings(); fireEvent.click(screen.getByRole('button', { name: /^Light/ })); fireEvent.click(screen.getByRole('tab', { name: 'Play', exact: true })); expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument(); });
  it('works with direct reusable ThemeControls usage', () => { const onThemeChange = vi.fn(); const onAccentChange = vi.fn(); render(<ThemeControls themePreference="system" accent="blue" onThemeChange={onThemeChange} onAccentChange={onAccentChange} />); fireEvent.click(screen.getByRole('button', { name: /^Light/ })); fireEvent.click(screen.getByRole('button', { name: /^Purple/ })); expect(onThemeChange).toHaveBeenCalledWith('light'); expect(onAccentChange).toHaveBeenCalledWith('purple'); });
  it('ignores invalid persisted values and keeps safe defaults', () => { localStorage.setItem(THEME_STORAGE_KEY, 'neon'); localStorage.setItem(ACCENT_STORAGE_KEY, 'orange'); render(<App />); expect(document.documentElement.dataset.themePreference).toBe('dark'); expect(document.documentElement.dataset.accent).toBe('green'); });
  it('preserves existing PWA status notices across themes', () => { render(<App />); fireEvent(window, new Event('offline')); expect(screen.getByText(/local gameplay is still available/)).toBeInTheDocument(); openSettings(); fireEvent.click(screen.getByRole('button', { name: /^Purple/ })); expect(screen.getByText(/local gameplay is still available/)).toBeInTheDocument(); });
  it('keeps appearance controls contained at the Settings level', () => { render(<App />); openSettings(); expect(screen.getAllByRole('region', { name: 'Appearance' })).toHaveLength(1); expect(screen.getAllByRole('button', { name: /^Dark/ })).toHaveLength(1); });
});
