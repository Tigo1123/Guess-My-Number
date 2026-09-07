import { DIFFICULTIES } from '../constants/difficulty';

export function getLocalDateKey(dateInput = new Date()) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

export function seededRandom(seed) {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function createDailyChallenge(dateKey = getLocalDateKey()) {
  let seed = stringToSeed(`guess-my-number-daily-${dateKey}`);

  const rand1 = seededRandom(seed);
  seed += 1;
  const rand2 = seededRandom(seed);
  seed += 1;
  const rand3 = seededRandom(seed);

  const diffKeys = ['easy', 'medium', 'hard'];
  const difficulty = diffKeys[Math.floor(rand1 * diffKeys.length)];

  const modeKeys = ['classic', 'timed', 'limited'];
  const mode = modeKeys[Math.floor(rand2 * modeKeys.length)];

  const config = DIFFICULTIES[difficulty];
  const secretNumber = Math.floor(rand3 * config.maxNumber) + 1;

  return {
    dateKey,
    difficulty,
    mode,
    secretNumber,
    config,
  };
}

export function getYesterdayDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date);
}
