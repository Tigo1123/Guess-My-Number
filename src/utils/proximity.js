const LEVELS = ['almost', 'high', 'low'];

export function getProximityLevel(guess, secretNumber, maxNumber) {
  const guessValue = Number(guess);
  const secretValue = Number(secretNumber);
  const range = Number(maxNumber);
  if (![guessValue, secretValue, range].every(Number.isFinite) || range <= 0 || guessValue === secretValue) return null;
  const difference = Math.abs(guessValue - secretValue);
  const direction = guessValue > secretValue ? 'high' : 'low';
  return { level: difference === 1 ? LEVELS[0] : direction, difference, direction };
}

export const PROXIMITY_LEVELS = LEVELS;
