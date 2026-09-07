import { useCallback, useRef, useEffect } from 'react';
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

  const getAudioContext = useCallback(async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume().catch(() => {});
      }

      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playTone = useCallback(async (freq, duration, type = 'sine', gainVal = 0.1) => {
    if (!soundEnabled) return;
    try {
      const ctx = await getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }
      if (ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // ignore disconnect errors
        }
      };
    } catch {
      // Audio errors must never interrupt gameplay
    }
  }, [getAudioContext, soundEnabled]);

  const initAudioOnUserGesture = useCallback(() => {
    if (soundEnabled) {
      getAudioContext().catch(() => {});
    }
  }, [getAudioContext, soundEnabled]);

  // Automatically prime AudioContext on first user gesture when sound is enabled
  useEffect(() => {
    if (!soundEnabled) return;
    const handleGesture = () => {
      getAudioContext().catch(() => {});
    };
    window.addEventListener('click', handleGesture, { capture: true, once: true });
    window.addEventListener('keydown', handleGesture, { capture: true, once: true });
    return () => {
      window.removeEventListener('click', handleGesture, { capture: true });
      window.removeEventListener('keydown', handleGesture, { capture: true });
    };
  }, [getAudioContext, soundEnabled]);

  const playCorrect = useCallback(() => {
    if (!soundEnabled) return;
    playTone(523.25, 0.15, 'triangle', 0.15); // C5
    setTimeout(() => playTone(659.25, 0.2, 'triangle', 0.15), 100); // E5
    setTimeout(() => playTone(783.99, 0.3, 'triangle', 0.2), 200); // G5
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

  const playHint = useCallback(() => {
    if (!soundEnabled) return;
    playTone(587.33, 0.12, 'sine', 0.1);
  }, [playTone, soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        getAudioContext().catch(() => {});
      }
      return next;
    });
  }, [getAudioContext, setSoundEnabled]);

  return {
    soundEnabled,
    toggleSound,
    initAudioOnUserGesture,
    playCorrect,
    playWrong,
    playAchievement,
    playTimeWarning,
    playHint,
  };
}
