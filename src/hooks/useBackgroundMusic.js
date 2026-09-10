import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const MUSIC_ENABLED_KEY = 'guess_my_number_music_enabled';
// Backwards-compatible migration surface for the old Phase 20 setting.
export const MUSIC_VOLUME_KEY = 'guess_my_number_music_volume';
const DEFAULT_VOLUME = 0.3;
const sanitizeEnabled = (value) => typeof value === 'boolean' ? value : false;
const sanitizeVolume = (value) => typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_VOLUME;

export function useBackgroundMusic() {
  const [musicEnabled, setMusicEnabled] = useLocalStorage(MUSIC_ENABLED_KEY, false, sanitizeEnabled);
  // Retained internally for compatibility; the new Settings UI intentionally hides volume control.
  const [musicVolume, setMusicVolume] = useLocalStorage(MUSIC_VOLUME_KEY, DEFAULT_VOLUME, sanitizeVolume);
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const gainRef = useRef(null);
  const sourceRef = useRef(null);
  const bufferRef = useRef(null);
  const loadPromiseRef = useRef(null);
  const retryCleanupRef = useRef(null);

  const getContext = useCallback(() => {
    if (contextRef.current) return contextRef.current;
    const Context = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!Context) return null;
    try { contextRef.current = new Context(); return contextRef.current; } catch { return null; }
  }, []);

  const getFallbackAudio = useCallback(() => {
    if (audioRef.current || typeof Audio === 'undefined') return audioRef.current;
    try {
      const audio = new Audio('/audio/ambient-loop.wav');
      audio.loop = true; audio.preload = 'auto'; audio.volume = musicVolume;
      audioRef.current = audio; return audio;
    } catch { return null; }
  }, [musicVolume]);

  const stopSource = useCallback(() => {
    if (!sourceRef.current) return;
    try { sourceRef.current.stop(); } catch { /* already stopped */ }
    try { sourceRef.current.disconnect(); } catch { /* already disconnected */ }
    sourceRef.current = null;
  }, []);

  const startWebAudio = useCallback(async () => {
    const context = getContext();
    if (!context) return false;
    try {
      if (context.state === 'suspended') await context.resume();
      if (!bufferRef.current) {
        if (!loadPromiseRef.current) {
          loadPromiseRef.current = fetch('/audio/ambient-loop.wav')
            .then((response) => response.arrayBuffer())
            .then((data) => context.decodeAudioData(data))
            .then((buffer) => { bufferRef.current = buffer; return buffer; })
            .finally(() => { loadPromiseRef.current = null; });
        }
        await loadPromiseRef.current;
      }
      if (!sourceRef.current && bufferRef.current) {
        const source = context.createBufferSource();
        const gain = gainRef.current || context.createGain();
        gain.gain.value = musicVolume;
        source.buffer = bufferRef.current; source.loop = true;
        source.connect(gain); gain.connect(context.destination); source.start(0);
        sourceRef.current = source; gainRef.current = gain;
      }
      return true;
    } catch { return false; }
  }, [getContext, musicVolume]);

  const clearRetry = useCallback(() => { retryCleanupRef.current?.(); retryCleanupRef.current = null; }, []);
  const attemptPlay = useCallback(async () => {
    if (!musicEnabled || document.visibilityState === 'hidden') return;
    const context = getContext();
    let success = false;
    if (context) success = await startWebAudio();
    if (!context) {
      const audio = getFallbackAudio();
      if (audio) {
        audio.volume = musicVolume;
        try { await audio.play(); success = true; } catch { success = false; }
      }
    }
    if (!success) {
      clearRetry();
      const retry = () => { clearRetry(); attemptPlay(); };
      window.addEventListener('pointerdown', retry, { once: true });
      window.addEventListener('keydown', retry, { once: true });
      retryCleanupRef.current = () => { window.removeEventListener('pointerdown', retry); window.removeEventListener('keydown', retry); };
    }
  }, [clearRetry, getContext, getFallbackAudio, musicEnabled, musicVolume, startWebAudio]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = musicVolume;
    if (audioRef.current) audioRef.current.volume = musicVolume;
  }, [musicVolume]);

  useEffect(() => {
    if (musicEnabled) {
      if (!sourceRef.current && !audioRef.current) attemptPlay();
    } else {
      clearRetry(); stopSource(); audioRef.current?.pause();
    }
  }, [attemptPlay, clearRetry, musicEnabled, stopSource]);

  useEffect(() => {
    const visibility = () => {
      const context = contextRef.current;
      if (document.visibilityState === 'hidden') {
        if (context?.state === 'running') context.suspend?.();
        audioRef.current?.pause();
      } else if (musicEnabled) {
        if (context?.state === 'suspended' && sourceRef.current) context.resume?.();
        else if (!sourceRef.current && !audioRef.current) attemptPlay();
        else if (audioRef.current) attemptPlay();
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); clearRetry(); stopSource(); audioRef.current?.pause(); };
  }, [attemptPlay, clearRetry, musicEnabled, stopSource]);

  const toggleMusic = useCallback(() => setMusicEnabled((value) => !value), [setMusicEnabled]);
  return { musicEnabled, musicVolume, setMusicVolume, toggleMusic, audioRef };
}
