const LEVELS = ['almost', 'very-close', 'close', 'far'];

export function getProximityLevel(guess, secretNumber, maxNumber) {
  const guessValue = Number(guess);
  const secretValue = Number(secretNumber);
  const range = Number(maxNumber);
  if (![guessValue, secretValue, range].every(Number.isFinite) || range <= 0 || guessValue === secretValue) return null;
  const difference = Math.abs(guessValue - secretValue);
  // Keep the one-number "almost" moment universal, then scale wider bands by range.
  const veryCloseThreshold = Math.max(3, Math.round(range * 0.08));
  const closeThreshold = Math.max(6, Math.round(range * 0.16));
  const level = difference <= 1 ? LEVELS[0] : difference <= veryCloseThreshold ? LEVELS[1] : difference <= closeThreshold ? LEVELS[2] : LEVELS[3];
  return { level, difference, direction: guessValue > secretValue ? 'high' : 'low' };
}

export const PROXIMITY_LEVELS = LEVELS;
