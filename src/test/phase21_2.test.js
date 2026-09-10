import { describe, expect, it } from 'vitest';
import { getProximityLevel } from '../utils/proximity';

describe('Phase 21.2 proximity utility', () => {
  it('returns directional Almost for one-away guesses', () => {
    expect(getProximityLevel(20, 19, 20)).toMatchObject({ level: 'almost', difference: 1, direction: 'high' });
    expect(getProximityLevel(18, 19, 20)).toMatchObject({ level: 'almost', difference: 1, direction: 'low' });
  });
  it('uses only directional feedback for every non-adjacent guess', () => {
    expect(getProximityLevel(16, 19, 20)).toMatchObject({ level: 'low', direction: 'low', difference: 3 });
    expect(getProximityLevel(22, 19, 50)).toMatchObject({ level: 'high', direction: 'high', difference: 3 });
    expect(getProximityLevel(1, 100, 100)).toMatchObject({ level: 'low', direction: 'low', difference: 99 });
  });
  it('returns null for a correct guess so win state owns the feedback', () => {
    expect(getProximityLevel(19, 19, 20)).toBeNull();
  });
  it('uses the same deterministic rules for friend, timed, limited and daily callers', () => {
    const results = [
      getProximityLevel(20, 19, 20), getProximityLevel(20, 19, 20),
      getProximityLevel(20, 19, 20), getProximityLevel(20, 19, 20),
    ];
    expect(results.every((result) => result.level === 'almost' && result.direction === 'high')).toBe(true);
  });
  it('handles invalid values safely', () => {
    expect(getProximityLevel('bad', 19, 20)).toBeNull();
    expect(getProximityLevel(20, 19, 0)).toBeNull();
  });
});
