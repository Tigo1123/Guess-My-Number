import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { App } from '../App';
import { InstallAppControl } from '../components/InstallAppControl';
import { PwaStatusNotice } from '../components/PwaStatusNotice';
import { PwaUpdatePrompt } from '../components/PwaUpdatePrompt';

const { updateMock } = vi.hoisted(() => ({ updateMock: vi.fn() }));
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({ needRefresh: [true], updateServiceWorker: updateMock }),
}));

const promptEvent = (outcome = 'accepted') => ({ preventDefault: vi.fn(), prompt: vi.fn(), userChoice: Promise.resolve({ outcome }) });

describe('Phase 16 PWA application behavior', () => {
  beforeEach(() => { localStorage.clear(); vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('hides install when the browser offers no install prompt', () => {
    render(<App />); fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument();
  });
  it('shows install after beforeinstallprompt and invokes the saved prompt', async () => {
    render(<App />); const event = Object.assign(new Event('beforeinstallprompt'), promptEvent());
    act(() => window.dispatchEvent(event));
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /install app/i })));
    expect(event.prompt).toHaveBeenCalled();
  });
  it('handles accepted and dismissed install choices without crashing', async () => {
    const event = Object.assign(new Event('beforeinstallprompt'), promptEvent('dismissed')); render(<App />);
    act(() => window.dispatchEvent(event));
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /install app/i })));
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument();
  });
  it('hides install in standalone display mode', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<App />); fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument();
  });
  it('renders accessible offline and recovery notices', () => {
    const { rerender } = render(<PwaStatusNotice isOffline showBackOnline={false} />);
    expect(screen.getByRole('status')).toHaveTextContent(/offline.*local gameplay/i);
    rerender(<PwaStatusNotice isOffline={false} showBackOnline />);
    expect(screen.getByRole('status')).toHaveTextContent('Back online');
  });
  it('renders an accessible update action without stealing focus', () => {
    render(<PwaUpdatePrompt />);
    expect(screen.getByRole('button', { name: 'Update' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(updateMock).toHaveBeenCalledWith(true);
  });
  it('keeps gameplay and stored profiles available', () => {
    localStorage.setItem('guess_my_number_profiles', JSON.stringify({ version: 1, profiles: [{ id: 'p', name: 'Saved', progress: { gameHistory: [] } }], activeProfileId: 'p' }));
    render(<App />);
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument();
    expect(localStorage.getItem('guess_my_number_profiles')).toContain('Saved');
  });
  it('keeps PWA controls isolated from the active player panel', () => {
    render(<App />); fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.getByRole('region', { name: 'Game Preferences' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Install Application' })).toBeInTheDocument();
    expect(screen.queryByText(/Player 1.*install/i)).not.toBeInTheDocument();
  });
  it('does not crash when optional browser APIs are absent', () => {
    vi.stubGlobal('matchMedia', undefined); vi.stubGlobal('navigator', { onLine: true });
    expect(() => render(<App />)).not.toThrow();
  });
});
