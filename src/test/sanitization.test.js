import { describe, it, expect } from 'vitest';
import { sanitizeHighScores, sanitizeStatistics } from '../hooks/useGameState';

describe('Data Sanitization & Corruption Fallbacks', () => {
  describe('High Scores Normalization', () => {
    it('returns default 0 for malformed root inputs (null, arrays, primitives)', () => {
      expect(sanitizeHighScores(null)).toEqual({ easy: 0, medium: 0, hard: 0 });
      expect(sanitizeHighScores([10, 20])).toEqual({ easy: 0, medium: 0, hard: 0 });
      expect(sanitizeHighScores('corrupted')).toEqual({ easy: 0, medium: 0, hard: 0 });
    });

    it('falls back to 0 for corrupted fields (strings, negative, decimals, NaN)', () => {
      const corrupted = {
        easy: '20',
        medium: -15,
        hard: 10.5,
      };
      expect(sanitizeHighScores(corrupted)).toEqual({ easy: 0, medium: 0, hard: 0 });
    });

    it('preserves valid non-negative integers', () => {
      const valid = { easy: 18, medium: 12, hard: 8 };
      expect(sanitizeHighScores(valid)).toEqual({ easy: 18, medium: 12, hard: 8 });
    });
  });

  describe('Statistics Normalization', () => {
    it('returns default zero statistics for malformed root inputs', () => {
      const expectedFallback = {
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalValidGuesses: 0,
        byDifficulty: {
          easy: { games: 0, wins: 0, losses: 0 },
          medium: { games: 0, wins: 0, losses: 0 },
          hard: { games: 0, wins: 0, losses: 0 },
        },
      };

      expect(sanitizeStatistics(null)).toEqual(expectedFallback);
      expect(sanitizeStatistics('bad JSON')).toEqual(expectedFallback);
      expect(sanitizeStatistics([1, 2, 3])).toEqual(expectedFallback);
    });

    it('sanitizes individual corrupted counter fields to 0', () => {
      const corrupted = {
        totalGames: '10',
        totalWins: -5,
        totalLosses: 2.5,
        totalValidGuesses: NaN,
        byDifficulty: {
          easy: { games: '5', wins: -2, losses: null },
        },
      };

      const sanitized = sanitizeStatistics(corrupted);
      expect(sanitized.totalGames).toBe(0);
      expect(sanitized.totalWins).toBe(0);
      expect(sanitized.totalLosses).toBe(0);
      expect(sanitized.totalValidGuesses).toBe(0);
      expect(sanitized.byDifficulty.easy).toEqual({ games: 0, wins: 0, losses: 0 });
    });

    it('preserves valid statistics structure', () => {
      const validStats = {
        totalGames: 5,
        totalWins: 3,
        totalLosses: 2,
        totalValidGuesses: 25,
        byDifficulty: {
          easy: { games: 3, wins: 2, losses: 1 },
          medium: { games: 2, wins: 1, losses: 1 },
          hard: { games: 0, wins: 0, losses: 0 },
        },
      };

      expect(sanitizeStatistics(validStats)).toEqual(validStats);
    });
  });
});
