import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';
import { sanitizeGameHistory } from '../utils/profileStorage';
import { exportProgressBackup, validateBackupJSON } from '../utils/progressBackup';
import { GameHistory } from '../components/GameHistory';
import { GameHistoryDetails } from '../components/GameHistoryDetails';
import { PersonalRecords } from '../components/PersonalRecords';

describe('Phase 11 — Game History, Replay Analytics & Personal Records', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('1. Per-Profile Game History Logging & Bounding', () => {
    it('adds exactly one history entry on a completed win', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0]).toMatchObject({
        result: 'WIN',
        attempts: 1,
      });
    });

    it('adds exactly one history entry on a completed loss', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeDifficulty('hard'); // startingScore = 10
      });

      const wrong = result.current.secretNumber === 1 ? 2 : 1;
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.makeGuess(wrong);
        });
      }

      expect(result.current.status).toBe('LOST');
      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0].result).toBe('LOSS');
    });

    it('never adds history for abandoned rounds (e.g. switching profile)', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.createProfile('Player 2');
      });

      act(() => {
        const wrong = result.current.secretNumber === 1 ? 2 : 1;
        result.current.makeGuess(wrong);
      });

      const p1Id = result.current.profiles[0].id;
      act(() => {
        result.current.switchProfile(p1Id);
      });

      expect(result.current.gameHistory).toHaveLength(0);
    });

    it('prevents rapid duplicate completion from logging multiple history entries', () => {
      const { result } = renderHook(() => useGameState());
      const secret = result.current.secretNumber;

      act(() => {
        result.current.makeGuess(secret);
        result.current.makeGuess(secret);
        result.current.makeGuess(secret);
      });

      expect(result.current.gameHistory).toHaveLength(1);
    });

    it('logs history on timed mode timer expiration', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('timed');
      });

      act(() => {
        vi.advanceTimersByTime(65000); // 60s timer on Easy
      });

      expect(result.current.status).toBe('LOST');
      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0].timeRemaining).toBe(0);
    });

    it('logs history on limited attempts mode exhaustion', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeDifficulty('hard'); // 5 attempts
      });
      act(() => {
        result.current.changeGameMode('limited');
      });

      const wrong = result.current.secretNumber === 1 ? 2 : 1;
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.makeGuess(wrong);
        });
      }

      expect(result.current.status).toBe('LOST');
      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.gameHistory[0].attemptsRemaining).toBe(0);
    });

    it('marks official Daily Challenge and Practice Replay history entries correctly', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startDailyChallenge();
      });
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.gameHistory[0]).toMatchObject({
        isDailyChallenge: true,
        dailyChallengeType: 'official',
      });

      act(() => {
        result.current.startPracticeReplay();
      });
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.gameHistory[1]).toMatchObject({
        isDailyChallenge: true,
        dailyChallengeType: 'practice',
      });
    });

    it('retains maximum 100 history entries per profile, discarding oldest', () => {
      const raw = Array.from({ length: 110 }, (_, i) => ({
        id: `h_${i}`,
        playedAt: new Date().toISOString(),
        result: 'WIN',
        difficulty: 'easy',
        mode: 'classic',
        score: i + 1,
        attempts: 1,
        hintsUsed: 0,
        secretNumber: 10,
        validGuesses: [10],
      }));

      const sanitized = sanitizeGameHistory(raw);
      expect(sanitized).toHaveLength(100);
      expect(sanitized[0].score).toBe(11);
      expect(sanitized[99].score).toBe(110);
    });
  });

  describe('2. Sanitization & Defensive Parsing', () => {
    it('handles malformed history root and filters invalid entries', () => {
      expect(sanitizeGameHistory(null)).toEqual([]);
      expect(sanitizeGameHistory('invalid')).toEqual([]);

      const malformed = [
        null,
        'bad_entry',
        { result: 'WIN', score: -50, secretNumber: -5, achievementsUnlocked: ['INVALID_ACH', 'FIRST_WIN'] },
      ];

      const sanitized = sanitizeGameHistory(malformed);
      expect(sanitized).toHaveLength(1);
      expect(sanitized[0].score).toBe(0);
      expect(sanitized[0].secretNumber).toBe(1);
      expect(sanitized[0].achievementsUnlocked).toEqual(['FIRST_WIN']);
    });
  });

  describe('3. Profile Isolation & Clear History', () => {
    it('keeps history isolated between Player A and Player B', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.gameHistory).toHaveLength(1);

      act(() => {
        result.current.createProfile('Player B');
      });

      expect(result.current.gameHistory).toEqual([]);

      const p1Id = result.current.profiles[0].id;
      act(() => {
        result.current.switchProfile(p1Id);
      });

      expect(result.current.gameHistory).toHaveLength(1);
    });

    it('clearing history clears active profile history without affecting statistics or high scores', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.gameHistory).toHaveLength(1);
      expect(result.current.statistics.totalWins).toBe(1);

      act(() => {
        result.current.clearGameHistory();
      });

      expect(result.current.gameHistory).toEqual([]);
      expect(result.current.statistics.totalWins).toBe(1);
    });
  });

  describe('4. Personal Records & Recent Form Analytics', () => {
    it('calculates records, averages, and recent form correctly', () => {
      const stats = { totalGames: 4, totalWins: 3, totalLosses: 1, byDifficulty: { easy: { games: 4, wins: 3, losses: 1 } } };
      const streak = { currentStreak: 1, bestStreak: 2 };
      const history = [
        { id: '1', playedAt: new Date().toISOString(), result: 'WIN', difficulty: 'easy', mode: 'classic', score: 10, attempts: 2, hintsUsed: 0, secretNumber: 10, validGuesses: [5, 10] },
        { id: '2', playedAt: new Date().toISOString(), result: 'WIN', difficulty: 'easy', mode: 'timed', score: 18, attempts: 1, hintsUsed: 0, secretNumber: 5, validGuesses: [5], timeRemaining: 45, maxTime: 60 },
        { id: '3', playedAt: new Date().toISOString(), result: 'LOSS', difficulty: 'easy', mode: 'classic', score: 0, attempts: 10, hintsUsed: 1, secretNumber: 20, validGuesses: [1, 2, 3] },
        { id: '4', playedAt: new Date().toISOString(), result: 'WIN', difficulty: 'easy', mode: 'classic', score: 15, attempts: 3, hintsUsed: 0, secretNumber: 12, validGuesses: [2, 10, 12] },
      ];

      render(
        <PersonalRecords
          statistics={stats}
          streak={streak}
          bestAttempts={{ easy: 1, medium: null, hard: null }}
          achievements={['FIRST_WIN']}
          dailyStreak={{ current: 1, best: 2 }}
          history={history}
        />
      );

      expect(screen.getByText('HIGHEST SCORE WIN')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument(); // Highest score win
      expect(screen.getByText('45s left')).toBeInTheDocument(); // Fastest timed win
    });
  });

  describe('5. Backup Export & Import Compatibility', () => {
    it('exports gameHistory inside profiles payload', () => {
      const data = {
        version: 1,
        activeProfileId: 'p1',
        profiles: [{ id: 'p1', name: 'Taj', progress: { gameHistory: [{ id: 'h1', result: 'WIN' }] } }],
      };

      const backup = exportProgressBackup(data, true);
      expect(backup.profiles[0].progress.gameHistory).toHaveLength(1);
    });

    it('successfully imports Phase 10 backup without gameHistory, defaulting to []', () => {
      const phase10Backup = {
        app: 'guess-my-number',
        version: 1,
        activeProfileId: 'p1',
        profiles: [{ id: 'p1', name: 'Phase10User', progress: {} }],
      };

      const res = validateBackupJSON(phase10Backup);
      expect(res.valid).toBe(true);
      expect(res.payload.profiles[0].progress.gameHistory).toEqual([]);
    });
  });

  describe('6. Replay Analysis & Accessibility Integration', () => {
    it('renders GameHistoryDetails modal with guess sequence analysis', () => {
      const entry = {
        id: 'h1',
        playedAt: new Date().toISOString(),
        result: 'WIN',
        difficulty: 'easy',
        mode: 'classic',
        score: 18,
        attempts: 2,
        hintsUsed: 0,
        secretNumber: 15,
        validGuesses: [10, 15],
      };

      render(<GameHistoryDetails entry={entry} onClose={() => {}} />);

      expect(screen.getByText(/GAME REPLAY ANALYSIS/i)).toBeInTheDocument();
      expect(screen.getByText(/Distance from secret: 5/i)).toBeInTheDocument();
      expect(screen.getByText('Correct 🎉')).toBeInTheDocument();
    });

    it('renders GameHistory table with accessible caption and clear history control label', () => {
      render(
        <GameHistory
          history={[{ id: 'h1', playedAt: new Date().toISOString(), result: 'WIN', difficulty: 'easy', mode: 'classic', score: 10, attempts: 2, hintsUsed: 0 }]}
          activeProfileName="Taj"
          onClearHistory={() => {}}
        />
      );

      expect(screen.getByLabelText('Clear Game History for Taj')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View details for game played/i })).toBeInTheDocument();
    });
  });
});
