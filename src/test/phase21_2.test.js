import { describe, expect, it } from 'vitest';
import { getProximityLevel } from '../utils/proximity';

describe('Phase 21.2 proximity utility', () => {
  it('returns directional Almost for one-away guesses', () => {
    expect(getProximityLevel(20, 19, 20)).toMatchObject({ level: 'almost', difference: 1, direction: 'high' });
    expect(getProximityLevel(18, 19, 20)).toMatchObject({ level: 'almost', difference: 1, direction: 'low' });
  });
  it('scales very close and close thresholds by difficulty range', () => {
    expect(getProximityLevel(16, 19, 20).level).toBe('very-close');
    expect(getProximityLevel(15, 19, 50).level).toBe('very-close');
    expect(getProximityLevel(90, 100, 100).level).toBe('close');
    expect(getProximityLevel(70, 100, 100).level).toBe('far');
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
