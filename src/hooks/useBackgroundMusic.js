import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const MUSIC_ENABLED_KEY = 'guess_my_number_music_enabled';
export const MUSIC_VOLUME_KEY = 'guess_my_number_music_volume';
const sanitizeEnabled = (value) => typeof value === 'boolean' ? value : false;
const sanitizeVolume = (value) => typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.35;

export function useBackgroundMusic() {
  const [musicEnabled, setMusicEnabled] = useLocalStorage(MUSIC_ENABLED_KEY, false, sanitizeEnabled);
  const [musicVolume, setMusicVolume] = useLocalStorage(MUSIC_VOLUME_KEY, 0.35, sanitizeVolume);
  const audioRef = useRef(null);
  const retryCleanupRef = useRef(null);

  const getAudio = useCallback(() => {
    if (audioRef.current || typeof Audio === 'undefined') return audioRef.current;
    try { const audio = new Audio('/audio/ambient-loop.wav'); audio.loop = true; audio.preload = 'auto'; audio.volume = musicVolume; audioRef.current = audio; return audio; } catch { return null; }
  }, [musicVolume]);

  const clearRetry = useCallback(() => { retryCleanupRef.current?.(); retryCleanupRef.current = null; }, []);
  const attemptPlay = useCallback(() => {
    const audio = getAudio();
    if (!audio || !musicEnabled || document.visibilityState === 'hidden') return;
    audio.volume = musicVolume;
    const result = audio.play();
    if (result?.catch) result.catch(() => {
      clearRetry();
      const retry = () => { clearRetry(); attemptPlay(); };
      window.addEventListener('pointerdown', retry, { once: true });
      window.addEventListener('keydown', retry, { once: true });
      retryCleanupRef.current = () => { window.removeEventListener('pointerdown', retry); window.removeEventListener('keydown', retry); };
    });
  }, [clearRetry, getAudio, musicEnabled, musicVolume]);

  useEffect(() => { const audio = audioRef.current; if (audio) audio.volume = musicVolume; }, [musicVolume]);
  useEffect(() => {
    if (musicEnabled) {
      if (!audioRef.current) attemptPlay();
    } else {
      clearRetry();
      audioRef.current?.pause();
    }
  }, [attemptPlay, clearRetry, musicEnabled]);
  useEffect(() => {
    const visibility = () => { if (document.visibilityState === 'hidden') audioRef.current?.pause(); else if (musicEnabled) attemptPlay(); };
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); clearRetry(); audioRef.current?.pause(); };
  }, [attemptPlay, clearRetry, musicEnabled]);

  const toggleMusic = useCallback(() => setMusicEnabled((value) => !value), [setMusicEnabled]);
  return { musicEnabled, musicVolume, setMusicVolume, toggleMusic, audioRef };
}
