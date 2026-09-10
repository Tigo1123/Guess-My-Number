import { DIFFICULTIES } from '../constants/difficulty';

export const CHALLENGE_VERSION = '1';
const SAFE_SEED = /^[A-Fa-f0-9]{8,32}$/;

export function generateChallengeSeed() {
  const bytes = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function validateChallenge({ version, difficulty, seed } = {}) {
  return version === CHALLENGE_VERSION && Object.prototype.hasOwnProperty.call(DIFFICULTIES, difficulty) && typeof seed === 'string' && SAFE_SEED.test(seed);
}

export function deriveChallengeNumber(seed, difficulty) {
  if (!validateChallenge({ version: CHALLENGE_VERSION, difficulty, seed })) return null;
  let hash = 2166136261;
  for (const char of `${seed}:${difficulty}`) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (Math.abs(hash) % DIFFICULTIES[difficulty].maxNumber) + 1;
}

export function createChallengeUrl({ difficulty, seed, baseUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost/' }) {
  if (!validateChallenge({ version: CHALLENGE_VERSION, difficulty, seed })) return null;
  const url = new URL(baseUrl);
  url.searchParams.set('challenge', CHALLENGE_VERSION);
  url.searchParams.set('difficulty', difficulty);
  url.searchParams.set('seed', seed);
  return url.toString();
}

export function parseChallengeUrl(input = typeof window !== 'undefined' ? window.location.href : '') {
  try {
    const url = new URL(input, 'http://localhost/');
    const params = url.searchParams;
    const values = ['challenge', 'difficulty', 'seed'].map((key) => params.getAll(key));
    if (values.some((items) => items.length !== 1)) return null;
    const [version, difficulty, seed] = values.map((items) => items[0]);
    return validateChallenge({ version, difficulty, seed }) ? { version, difficulty, seed } : null;
  } catch { return null; }
}

export function removeChallengeParams(input = typeof window !== 'undefined' ? window.location.href : '') {
  const url = new URL(input, 'http://localhost/');
  ['challenge', 'difficulty', 'seed'].forEach((key) => url.searchParams.delete(key));
  return url.toString();
}
