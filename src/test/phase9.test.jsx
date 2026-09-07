import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import {
  useGameState,
  sanitizeDailyChallengeHistory,
  sanitizeDailyStreak,
} from '../hooks/useGameState';
import {
  getLocalDateKey,
  createDailyChallenge,
} from '../utils/dailyChallenge';
import { ModeSelector } from '../components/ModeSelector';
import { AttemptsRemainingDisplay } from '../components/AttemptsRemainingDisplay';
import { DailyChallengePanel } from '../components/DailyChallengePanel';

describe('Phase 9 — Daily Challenge & Limited Attempts Mode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('1. Limited Attempts Mode', () => {
    it('provides correct attempt limits per difficulty (Easy: 10, Medium: 7, Hard: 5)', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('limited');
      });
      expect(result.current.config.maxAttempts).toBe(10);

      act(() => {
        result.current.changeDifficulty('medium');
      });
      expect(result.current.config.maxAttempts).toBe(7);

      act(() => {
        result.current.changeDifficulty('hard');
      });
      expect(result.current.config.maxAttempts).toBe(5);
    });

    it('does not consume attempt on invalid guess (empty, non-integer, out of range)', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('limited');
      });

      act(() => {
        result.current.makeGuess('');
        result.current.makeGuess('abc');
        result.current.makeGuess('12.5');
        result.current.makeGuess('999');
      });

      expect(result.current.attempts).toBe(0);
      expect(result.current.isInvalid).toBe(true);
    });

    it('consumes one attempt on a valid wrong guess', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('limited');
      });

      const wrongGuess = result.current.secretNumber === 1 ? 2 : 1;

      act(() => {
        result.current.makeGuess(wrongGuess);
      });

      expect(result.current.attempts).toBe(1);
      expect(result.current.isInvalid).toBe(false);
    });

    it('does not consume attempts when taking hints', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('limited');
      });

      act(() => {
        result.current.getHint();
      });

      expect(result.current.attempts).toBe(0);
      expect(result.current.hintsUsed).toBe(1);
    });

    it('causes round loss on the final allowed valid wrong guess', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeDifficulty('hard');
      });
      act(() => {
        result.current.changeGameMode('limited'); // maxAttempts = 5 on Hard
      });

      for (let i = 0; i < 5; i++) {
        act(() => {
          const wrongGuess = result.current.secretNumber === 1 ? 2 : 1;
          result.current.makeGuess(wrongGuess);
        });
      }

      expect(result.current.attempts).toBe(5);
      expect(result.current.status).toBe('LOST');
      expect(result.current.message).toMatch(/Exhausted|Game Over/i);
    });

    it('succeeds with WIN status if guessed correctly before exhaustion', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('limited');
      });

      const secret = result.current.secretNumber;

      act(() => {
        result.current.makeGuess(secret);
      });

      expect(result.current.status).toBe('WON');
      expect(result.current.attempts).toBe(1);
    });

    it('rejects further guesses after attempt exhaustion', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeDifficulty('hard');
      });
      act(() => {
        result.current.changeGameMode('limited'); // 5 attempts
      });

      for (let i = 0; i < 5; i++) {
        act(() => {
          const wrongGuess = result.current.secretNumber === 1 ? 2 : 1;
          result.current.makeGuess(wrongGuess);
        });
      }

      expect(result.current.status).toBe('LOST');

      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      // Status remains LOST and attempts stay 5
      expect(result.current.status).toBe('LOST');
      expect(result.current.attempts).toBe(5);
    });

    it('resets attempts when switching difficulty or game mode', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('limited');
      });

      act(() => {
        const wrongGuess = result.current.secretNumber === 1 ? 2 : 1;
        result.current.makeGuess(wrongGuess);
      });

      expect(result.current.attempts).toBe(1);

      act(() => {
        result.current.changeDifficulty('medium');
      });

      expect(result.current.attempts).toBe(0);

      act(() => {
        const wrongGuess = result.current.secretNumber === 1 ? 2 : 1;
        result.current.makeGuess(wrongGuess);
      });

      expect(result.current.attempts).toBe(1);

      act(() => {
        result.current.changeGameMode('classic');
      });

      expect(result.current.attempts).toBe(0);
    });
  });

  describe('2. Daily Challenge Deterministic Generation', () => {
    it('generates identical challenge for the same date string', () => {
      const dateStr = '2026-09-07';
      const challenge1 = createDailyChallenge(dateStr);
      const challenge2 = createDailyChallenge(dateStr);

      expect(challenge1.dateKey).toBe(dateStr);
      expect(challenge1.difficulty).toBe(challenge2.difficulty);
      expect(challenge1.mode).toBe(challenge2.mode);
      expect(challenge1.secretNumber).toBe(challenge2.secretNumber);
    });

    it('can produce different parameters for different dates', () => {
      const challengeA = createDailyChallenge('2026-01-01');
      const challengeB = createDailyChallenge('2026-12-31');

      expect(['easy', 'medium', 'hard']).toContain(challengeA.difficulty);
      expect(['classic', 'timed', 'limited']).toContain(challengeA.mode);
      expect(['easy', 'medium', 'hard']).toContain(challengeB.difficulty);
      expect(['classic', 'timed', 'limited']).toContain(challengeB.mode);
    });

    it('ensures generated secret number stays inside difficulty range', () => {
      const dates = ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'];
      for (const d of dates) {
        const ch = createDailyChallenge(d);
        expect(ch.secretNumber).toBeGreaterThanOrEqual(1);
        expect(ch.secretNumber).toBeLessThanOrEqual(ch.config.maxNumber);
      }
    });

    it('formats local date key in YYYY-MM-DD format', () => {
      const dateKey = getLocalDateKey(new Date(2026, 8, 7)); // Sep 7, 2026
      expect(dateKey).toBe('2026-09-07');
    });

    it('persists official Daily Challenge result and prevents overwriting same date', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startDailyChallenge();
      });

      expect(result.current.isDailyChallengeActive).toBe(true);
      expect(result.current.isPracticeReplay).toBe(false);

      // Win the official challenge
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.isCompletedToday).toBe(true);
      expect(result.current.todayResult).toMatchObject({
        completed: true,
        won: true,
      });

      // Try starting practice replay and losing
      act(() => {
        result.current.startPracticeReplay();
      });

      expect(result.current.isPracticeReplay).toBe(true);

      const wrong = result.current.secretNumber === 1 ? 2 : 1;
      act(() => {
        result.current.makeGuess(wrong);
      });

      // Official result must remain won = true
      expect(result.current.todayResult).toMatchObject({
        completed: true,
        won: true,
      });
    });

    it('sanitizes malformed stored Daily Challenge history', () => {
      const malformed = {
        '2026-09-07': { completed: 1, won: 'yes', attempts: -5, score: 'bad', mode: 123 },
        invalidDateKey: { completed: true },
        '2026-09-06': null,
      };

      const sanitized = sanitizeDailyChallengeHistory(malformed);
      expect(sanitized['2026-09-07']).toEqual({
        completed: true,
        won: true,
        attempts: 0,
        score: 0,
        mode: 'classic',
        difficulty: 'easy',
      });
      expect(sanitized.invalidDateKey).toBeUndefined();
    });
  });

  describe('3. Daily Streak System', () => {
    it('sets streak to 1 on first official Daily Challenge completion', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startDailyChallenge();
      });
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.dailyStreak).toEqual({
        current: 1,
        best: 1,
        lastCompletedDate: result.current.todayKey,
      });
    });

    it('Practice Replay does not alter daily streak', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startDailyChallenge();
      });
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.dailyStreak.current).toBe(1);

      act(() => {
        result.current.startPracticeReplay();
      });
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.dailyStreak.current).toBe(1);
    });

    it('sanitizes malformed stored daily streak data', () => {
      const malformed = { current: 'bad', best: -10, lastCompletedDate: 12345 };
      const sanitized = sanitizeDailyStreak(malformed);

      expect(sanitized).toEqual({
        current: 0,
        best: 0,
        lastCompletedDate: null,
      });
    });
  });

  describe('4. Daily Achievements', () => {
    it('unlocks DAILY_DEBUT on first official Daily Challenge completion', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startDailyChallenge();
      });

      for (let i = 0; i < 25; i++) {
        if (result.current.status !== 'PLAYING') break;
        act(() => {
          const wrong = result.current.secretNumber === 1 ? 2 : 1;
          result.current.makeGuess(wrong);
        });
      }

      expect(result.current.achievements).toContain('DAILY_DEBUT');
      expect(result.current.achievements).not.toContain('DAILY_WINNER');
    });

    it('unlocks DAILY_WINNER only on official Daily Challenge win', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startDailyChallenge();
      });
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.achievements).toContain('DAILY_DEBUT');
      expect(result.current.achievements).toContain('DAILY_WINNER');
    });

    it('prevents Practice Replay from unlocking official daily achievements', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startPracticeReplay();
      });
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.achievements).not.toContain('DAILY_DEBUT');
      expect(result.current.achievements).not.toContain('DAILY_WINNER');
    });
  });

  describe('5. State Integrity & Rapid Event Protection', () => {
    it('records statistics and daily results exactly once on game end', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.startDailyChallenge();
      });

      const secret = result.current.secretNumber;

      act(() => {
        result.current.makeGuess(secret);
        result.current.makeGuess(secret);
        result.current.makeGuess(secret);
      });

      expect(result.current.statistics.totalGames).toBe(1);
      expect(result.current.statistics.totalWins).toBe(1);
      expect(result.current.dailyStreak.current).toBe(1);
    });
  });

  describe('6. Accessibility & UI Integration', () => {
    it('exposes correct aria-pressed attribute on Limited Attempts mode button', () => {
      render(
        <ModeSelector
          activeMode="limited"
          onSelectMode={() => {}}
        />
      );

      const limitedBtn = screen.getByRole('button', { name: 'Limited Attempts' });
      expect(limitedBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('renders attempts remaining display with accessible label', () => {
      render(
        <AttemptsRemainingDisplay
          attempts={3}
          maxAttempts={10}
          isLimitedMode={true}
        />
      );

      const region = screen.getByLabelText(/attempts remaining/i);
      expect(region).toBeInTheDocument();
      expect(region).toHaveTextContent('7 / 10');
    });

    it('renders Daily Challenge panel with accessible action buttons and textual completion state', () => {
      render(
        <DailyChallengePanel
          todayKey="2026-09-07"
          dailyChallengeConfig={{ difficulty: 'medium', mode: 'timed' }}
          isCompletedToday={true}
          todayResult={{ completed: true, won: true, score: 15, attempts: 2 }}
          dailyStreak={{ current: 2, best: 5, lastCompletedDate: '2026-09-07' }}
          isDailyChallengeActive={false}
          isPracticeReplay={false}
          onStartDailyChallenge={() => {}}
          onStartPracticeReplay={() => {}}
          onExitDailyChallenge={() => {}}
        />
      );

      expect(screen.getByText(/Today's Challenge Completed ✅/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Practice Replay/i })).toBeInTheDocument();
    });
  });
});
