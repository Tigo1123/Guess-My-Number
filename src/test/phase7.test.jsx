import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { useGameState, sanitizeStreak, sanitizeBestAttempts } from '../hooks/useGameState';
import { ModeSelector } from '../components/ModeSelector';
import { TimerDisplay } from '../components/TimerDisplay';

describe('Phase 7 Features & Reliability', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Win Streak System', () => {
    it('increments current streak on win and updates best streak', () => {
      const { result } = renderHook(() => useGameState());
      const secret = result.current.secretNumber;

      act(() => {
        result.current.makeGuess(String(secret));
      });

      expect(result.current.streak.currentStreak).toBe(1);
      expect(result.current.streak.bestStreak).toBe(1);
    });

    it('increments streak on consecutive wins', () => {
      const { result } = renderHook(() => useGameState());

      // Win 1
      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });
      expect(result.current.streak.currentStreak).toBe(1);

      // Play Again
      act(() => {
        result.current.resetGame();
      });

      // Win 2
      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });
      expect(result.current.streak.currentStreak).toBe(2);
      expect(result.current.streak.bestStreak).toBe(2);
    });

    it('resets current streak to 0 on loss while preserving best streak', () => {
      const { result } = renderHook(() => useGameState());

      // Win round 1
      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });
      expect(result.current.streak.currentStreak).toBe(1);

      // Play Again & lose
      act(() => {
        result.current.resetGame();
      });

      for (let i = 0; i < 20; i++) {
        const currentSecret = result.current.secretNumber;
        const wrongGuess = currentSecret === 1 ? 2 : 1;
        act(() => {
          result.current.makeGuess(String(wrongGuess));
        });
      }

      expect(result.current.status).toBe('LOST');
      expect(result.current.streak.currentStreak).toBe(0);
      expect(result.current.streak.bestStreak).toBe(1);
    });

    it('sanitizes malformed stored streak data', () => {
      expect(sanitizeStreak(null)).toEqual({ currentStreak: 0, bestStreak: 0 });
      expect(sanitizeStreak({ currentStreak: 'bad', bestStreak: -5 })).toEqual({ currentStreak: 0, bestStreak: 0 });
      expect(sanitizeStreak({ currentStreak: 5, bestStreak: 2 })).toEqual({ currentStreak: 5, bestStreak: 5 });
    });

    it('prevents completion from updating streak twice', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });
      expect(result.current.streak.currentStreak).toBe(1);

      // Extra guess attempt on finished game
      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });
      expect(result.current.streak.currentStreak).toBe(1);
    });
  });

  describe('Best Attempts per Difficulty', () => {
    it('stores attempt count on first winning round', () => {
      const { result } = renderHook(() => useGameState());
      const secret = result.current.secretNumber;

      act(() => {
        result.current.makeGuess(String(secret));
      });

      expect(result.current.bestAttempts.easy).toBe(1);
    });

    it('replaces best attempts when a lower attempt count is achieved', () => {
      const { result } = renderHook(() => useGameState());

      // Win round 1 with 2 attempts (wrong guess first)
      const secret1 = result.current.secretNumber;
      const wrong1 = secret1 === 1 ? 2 : 1;
      act(() => {
        result.current.makeGuess(String(wrong1));
      });
      act(() => {
        result.current.makeGuess(String(secret1));
      });
      expect(result.current.bestAttempts.easy).toBe(2);

      // Round 2: win in 1 attempt
      act(() => {
        result.current.resetGame();
      });
      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      expect(result.current.bestAttempts.easy).toBe(1);
    });

    it('does not replace best attempts when a higher attempt count occurs', () => {
      const { result } = renderHook(() => useGameState());

      // Win in 1 attempt
      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });
      expect(result.current.bestAttempts.easy).toBe(1);

      // Round 2: win in 2 attempts
      act(() => {
        result.current.resetGame();
      });
      const secret2 = result.current.secretNumber;
      const wrong2 = secret2 === 1 ? 2 : 1;
      act(() => {
        result.current.makeGuess(String(wrong2));
      });
      act(() => {
        result.current.makeGuess(String(secret2));
      });

      expect(result.current.bestAttempts.easy).toBe(1);
    });

    it('sanitizes malformed best attempts stored data', () => {
      expect(sanitizeBestAttempts(null)).toEqual({ easy: null, medium: null, hard: null });
      expect(sanitizeBestAttempts({ easy: -5, medium: '3', hard: 0 })).toEqual({ easy: null, medium: null, hard: null });
      expect(sanitizeBestAttempts({ easy: 4 })).toEqual({ easy: 4, medium: null, hard: null });
    });
  });

  describe('Timed Challenge Mode', () => {
    it('uses correct duration per difficulty and counts down in timed mode', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('timed');
      });

      expect(result.current.gameMode).toBe('timed');
      expect(result.current.timeRemaining).toBe(60); // Easy duration 60s

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeRemaining).toBe(55);
    });

    it('triggers loss when timer reaches 0 and prevents further guesses', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('timed');
      });

      act(() => {
        vi.advanceTimersByTime(60000);
      });

      expect(result.current.status).toBe('LOST');
      expect(result.current.message).toBe('⏰ Time Expired! 💀 Game Over!');
      expect(result.current.statistics.totalLosses).toBe(1);
      expect(result.current.streak.currentStreak).toBe(0);

      // Extra guess rejected
      act(() => {
        result.current.makeGuess('5');
      });
      expect(result.current.attempts).toBe(0);
    });

    it('stops timer cleanly upon win before timeout', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('timed');
      });

      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      expect(result.current.status).toBe('WON');
      const savedRemaining = result.current.timeRemaining;

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.timeRemaining).toBe(savedRemaining);
    });

    it('resets timer duration properly on difficulty switch', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeGameMode('timed');
      });
      expect(result.current.timeRemaining).toBe(60);

      act(() => {
        result.current.changeDifficulty('medium');
      });

      expect(result.current.difficulty).toBe('medium');
      expect(result.current.timeRemaining).toBe(45); // Medium duration 45s
    });
  });

  describe('Phase 7 Accessibility', () => {
    it('exposes aria-pressed correctly on mode buttons', () => {
      render(
        <ModeSelector
          activeMode="classic"
          onSelectMode={() => {}}
        />
      );

      const classicBtn = screen.getByRole('button', { name: 'Classic Mode' });
      const timedBtn = screen.getByRole('button', { name: 'Timed Challenge' });

      expect(classicBtn).toHaveAttribute('aria-pressed', 'true');
      expect(timedBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('renders timer display with accessible label', () => {
      render(
        <TimerDisplay
          timeRemaining={45}
          isTimedMode={true}
        />
      );

      const timerRegion = screen.getByLabelText(/remaining time/i);
      expect(timerRegion).toBeInTheDocument();
      expect(timerRegion).toHaveTextContent('45s');
    });
  });
});
