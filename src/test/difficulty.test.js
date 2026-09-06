import { describe, it, expect } from 'vitest';
import { DIFFICULTIES } from '../constants/difficulty';

describe('Difficulty Configurations', () => {
  it('defines Easy difficulty with max 20 and starting score 20', () => {
    expect(DIFFICULTIES.easy).toBeDefined();
    expect(DIFFICULTIES.easy.maxNumber).toBe(20);
    expect(DIFFICULTIES.easy.startingScore).toBe(20);
  });

  it('defines Medium difficulty with max 50 and starting score 15', () => {
    expect(DIFFICULTIES.medium).toBeDefined();
    expect(DIFFICULTIES.medium.maxNumber).toBe(50);
    expect(DIFFICULTIES.medium.startingScore).toBe(15);
  });

  it('defines Hard difficulty with max 100 and starting score 10', () => {
    expect(DIFFICULTIES.hard).toBeDefined();
    expect(DIFFICULTIES.hard.maxNumber).toBe(100);
    expect(DIFFICULTIES.hard.startingScore).toBe(10);
  });
});
