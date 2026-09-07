import { useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

function sanitizeSoundPreference(val) {
  return typeof val === 'boolean' ? val : true;
}

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useLocalStorage(
    'guess_my_number_sound_enabled',
    true,
    sanitizeSoundPreference
  );

  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playTone = useCallback((freq, duration, type = 'sine', gainVal = 0.1) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio errors must never interrupt gameplay
    }
  }, [getAudioContext, soundEnabled]);

  const playCorrect = useCallback(() => {
    if (!soundEnabled) return;
    playTone(523.25, 0.15, 'triangle', 0.15); // C5
    setTimeout(() => playTone(659.25, 0.2, 'triangle', 0.15), 100); // E5
    setTimeout(() => playTone(783.99, 0.3, 'triangle', 0.15), 200); // G5
  }, [playTone, soundEnabled]);

  const playWrong = useCallback(() => {
    if (!soundEnabled) return;
    playTone(220, 0.2, 'sawtooth', 0.1); // A3
    setTimeout(() => playTone(180, 0.25, 'sawtooth', 0.1), 100);
  }, [playTone, soundEnabled]);

  const playAchievement = useCallback(() => {
    if (!soundEnabled) return;
    playTone(440, 0.1, 'square', 0.12);
    setTimeout(() => playTone(554.37, 0.1, 'square', 0.12), 80);
    setTimeout(() => playTone(659.25, 0.1, 'square', 0.12), 160);
    setTimeout(() => playTone(880, 0.3, 'square', 0.12), 240);
  }, [playTone, soundEnabled]);

  const playTimeWarning = useCallback(() => {
    if (!soundEnabled) return;
    playTone(880, 0.08, 'square', 0.08);
  }, [playTone, soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, [setSoundEnabled]);

  return {
    soundEnabled,
    toggleSound,
    playCorrect,
    playWrong,
    playAchievement,
    playTimeWarning,
  };
}
