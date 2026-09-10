import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBackgroundMusic, MUSIC_ENABLED_KEY, MUSIC_VOLUME_KEY } from '../hooks/useBackgroundMusic';

describe('background music preferences and lifecycle', () => {
  let OriginalAudio;
  let audio;
  beforeEach(() => {
    localStorage.clear();
    OriginalAudio = window.Audio;
    audio = { loop: false, preload: '', volume: 0, play: vi.fn(() => Promise.resolve()), pause: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
    window.Audio = vi.fn(() => audio);
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  });
  afterEach(() => { window.Audio = OriginalAudio; vi.restoreAllMocks(); });

  it('defaults music off and restores saved enabled/disabled values', () => {
    expect(renderHook(() => useBackgroundMusic()).result.current.musicEnabled).toBe(false);
    localStorage.setItem(MUSIC_ENABLED_KEY, 'true');
    expect(renderHook(() => useBackgroundMusic()).result.current.musicEnabled).toBe(true);
    localStorage.setItem(MUSIC_ENABLED_KEY, 'false');
    expect(renderHook(() => useBackgroundMusic()).result.current.musicEnabled).toBe(false);
  });
  it('enabling plays and disabling pauses', async () => {
    const { result } = renderHook(() => useBackgroundMusic());
    await act(async () => result.current.toggleMusic());
    expect(audio.play).toHaveBeenCalled();
    act(() => result.current.toggleMusic());
    expect(audio.pause).toHaveBeenCalled();
  });
  it('persists and applies a clamped volume', () => {
    const { result } = renderHook(() => useBackgroundMusic());
    act(() => result.current.toggleMusic());
    act(() => result.current.setMusicVolume(0.72));
    expect(result.current.musicVolume).toBe(0.72);
    expect(audio.volume).toBe(0.72);
    expect(localStorage.getItem(MUSIC_VOLUME_KEY)).toBe('0.72');
    localStorage.setItem(MUSIC_VOLUME_KEY, '99');
    expect(renderHook(() => useBackgroundMusic()).result.current.musicVolume).toBe(1);
  });
  it('keeps preference enabled when autoplay is rejected', async () => {
    audio.play.mockRejectedValueOnce(new Error('blocked'));
    const { result } = renderHook(() => useBackgroundMusic());
    await act(async () => result.current.toggleMusic());
    expect(result.current.musicEnabled).toBe(true);
    expect(localStorage.getItem(MUSIC_ENABLED_KEY)).toBe('true');
  });
  it('pauses while hidden and resumes when visible only when enabled', async () => {
    localStorage.setItem(MUSIC_ENABLED_KEY, 'true');
    const { result } = renderHook(() => useBackgroundMusic());
    await act(async () => Promise.resolve());
    audio.pause.mockClear(); audio.play.mockClear();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(audio.pause).toHaveBeenCalled();
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    await act(async () => document.dispatchEvent(new Event('visibilitychange')));
    expect(audio.play).toHaveBeenCalled();
    act(() => result.current.toggleMusic());
    audio.play.mockClear();
    await act(async () => document.dispatchEvent(new Event('visibilitychange')));
    expect(audio.play).not.toHaveBeenCalled();
  });
  it('does not touch gameplay storage and avoids creating audio until enabled', () => {
    localStorage.setItem('guess_my_number_history', JSON.stringify([{ result: 'WIN' }]));
    renderHook(() => useBackgroundMusic());
    expect(window.Audio).not.toHaveBeenCalled();
    expect(localStorage.getItem('guess_my_number_history')).toContain('WIN');
  });
});
