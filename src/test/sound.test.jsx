import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundEffects } from '../hooks/useSoundEffects';

describe('Sound Effects Hook & AudioContext Lifecycle', () => {
  let originalAudioContext;
  let mockAudioContextInstance;

  beforeEach(() => {
    localStorage.clear();
    originalAudioContext = window.AudioContext;

    mockAudioContextInstance = {
      state: 'suspended',
      currentTime: 0,
      destination: {},
      resume: vi.fn().mockImplementation(async function () {
        this.state = 'running';
      }),
      createOscillator: vi.fn().mockImplementation(() => ({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      })),
      createGain: vi.fn().mockImplementation(() => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
    };

    window.AudioContext = vi.fn().mockImplementation(() => mockAudioContextInstance);
  });

  afterEach(() => {
    window.AudioContext = originalAudioContext;
    vi.restoreAllMocks();
  });

  it('sound disabled => no oscillator or audio playback created', async () => {
    localStorage.setItem('guess_my_number_sound_enabled', JSON.stringify(false));
    const { result } = renderHook(() => useSoundEffects());

    expect(result.current.soundEnabled).toBe(false);

    await act(async () => {
      result.current.playCorrect();
    });

    expect(window.AudioContext).not.toHaveBeenCalled();
    expect(mockAudioContextInstance.createOscillator).not.toHaveBeenCalled();
  });

  it('sound enabled => playback path called and AudioContext instantiated', async () => {
    localStorage.setItem('guess_my_number_sound_enabled', JSON.stringify(true));
    const { result } = renderHook(() => useSoundEffects());

    expect(result.current.soundEnabled).toBe(true);

    await act(async () => {
      result.current.playWrong();
    });

    expect(window.AudioContext).toHaveBeenCalled();
    expect(mockAudioContextInstance.resume).toHaveBeenCalled();
    expect(mockAudioContextInstance.createOscillator).toHaveBeenCalled();
    expect(mockAudioContextInstance.createGain).toHaveBeenCalled();
  });

  it('suspended AudioContext => resume requested before playback', async () => {
    mockAudioContextInstance.state = 'suspended';
    const { result } = renderHook(() => useSoundEffects());

    await act(async () => {
      result.current.playHint();
    });

    expect(mockAudioContextInstance.resume).toHaveBeenCalled();
    expect(mockAudioContextInstance.state).toBe('running');
  });

  it('toggling OFF prevents later playback', async () => {
    const { result } = renderHook(() => useSoundEffects());

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(false);
    expect(localStorage.getItem('guess_my_number_sound_enabled')).toBe('false');

    await act(async () => {
      result.current.playCorrect();
    });

    expect(mockAudioContextInstance.createOscillator).not.toHaveBeenCalled();
  });

  it('toggling back ON allows later playback', async () => {
    localStorage.setItem('guess_my_number_sound_enabled', JSON.stringify(false));
    const { result } = renderHook(() => useSoundEffects());

    expect(result.current.soundEnabled).toBe(false);

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(true);
    expect(localStorage.getItem('guess_my_number_sound_enabled')).toBe('true');

    await act(async () => {
      result.current.playWrong();
    });

    expect(mockAudioContextInstance.createOscillator).toHaveBeenCalled();
  });

  it('unsupported AudioContext fails safely without throwing', async () => {
    delete window.AudioContext;
    delete window.webkitAudioContext;

    const { result } = renderHook(() => useSoundEffects());

    expect(() => {
      act(() => {
        result.current.playCorrect();
        result.current.playWrong();
        result.current.playAchievement();
        result.current.playTimeWarning();
        result.current.playHint();
      });
    }).not.toThrow();
  });

  it('localStorage preference remains intact and correctly stored', () => {
    const { result } = renderHook(() => useSoundEffects());

    expect(result.current.soundEnabled).toBe(true);
    expect(localStorage.getItem('guess_my_number_sound_enabled')).toBe('true');

    act(() => {
      result.current.toggleSound();
    });

    expect(localStorage.getItem('guess_my_number_sound_enabled')).toBe('false');
  });

  it('user gesture flow: ON -> audio plays on guess -> toggle OFF -> silence -> toggle ON -> audio plays again', async () => {
    const { render: renderComponent, screen: screenComp, fireEvent } = await import('@testing-library/react');
    const { App } = await import('../App');

    renderComponent(<App />);

    // 1. Enter valid guess when Sound Effects = ON
    const guessInput = screenComp.getByPlaceholderText(/enter your guess/i);
    const checkBtn = screenComp.getByRole('button', { name: /check/i });

    fireEvent.change(guessInput, { target: { value: '50' } });
    await act(async () => {
      fireEvent.click(checkBtn);
    });

    const initialOscCalls = mockAudioContextInstance.createOscillator.mock.calls.length;
    expect(initialOscCalls).toBeGreaterThan(0);

    // 2. Switch Sound Effects OFF in Settings
    const settingsTab = screenComp.getByRole('tab', { name: /settings/i });
    fireEvent.click(settingsTab);

    const soundToggle = document.querySelector('.btn-sound-toggle');
    fireEvent.click(soundToggle);
    expect(localStorage.getItem('guess_my_number_sound_enabled')).toBe('false');

    // 3. Make another valid guess with Sound Effects = OFF
    const playTab = screenComp.getByRole('tab', { name: /^play$/i });
    fireEvent.click(playTab);

    fireEvent.change(guessInput, { target: { value: '25' } });
    await act(async () => {
      fireEvent.click(checkBtn);
    });

    // Oscillator calls should remain unchanged (no new audio nodes created)
    expect(mockAudioContextInstance.createOscillator.mock.calls.length).toBe(initialOscCalls);

    // 4. Switch Sound Effects back ON in Settings
    fireEvent.click(settingsTab);
    fireEvent.click(soundToggle);
    expect(localStorage.getItem('guess_my_number_sound_enabled')).toBe('true');

    // 5. Make another valid guess with Sound Effects = ON again
    fireEvent.click(playTab);
    fireEvent.change(guessInput, { target: { value: '15' } });
    await act(async () => {
      fireEvent.click(checkBtn);
    });

    // Oscillator calls should increase
    expect(mockAudioContextInstance.createOscillator.mock.calls.length).toBeGreaterThan(initialOscCalls);
  });
});

