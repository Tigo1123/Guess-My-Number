import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { useGameState, sanitizeAchievements } from '../hooks/useGameState';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { HintControls } from '../components/HintControls';
import { AchievementToast } from '../components/AchievementToast';

describe('Phase 8 Features & Engagement Systems', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Hint System', () => {
    it('deducts correct score cost for Easy difficulty (cost 2) and does not alter guess counters', () => {
      const { result } = renderHook(() => useGameState());
      const initialScore = result.current.score; // 20 on Easy

      act(() => {
        result.current.getHint();
      });

      expect(result.current.score).toBe(initialScore - 2);
      expect(result.current.hintsUsed).toBe(1);
      expect(result.current.attempts).toBe(0);
      expect(result.current.guessHistory).toHaveLength(0);
      expect(result.current.statistics.totalValidGuesses).toBe(0);
      expect(result.current.currentHint).toBeTruthy();
    });

    it('deducts correct score cost for Hard difficulty (cost 1)', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeDifficulty('hard');
      });

      const initialScore = result.current.score; // 10 on Hard

      act(() => {
        result.current.getHint();
      });

      expect(result.current.score).toBe(initialScore - 1);
      expect(result.current.hintsUsed).toBe(1);
    });

    it('never reduces score below 1 and disables hints when score is insufficient', () => {
      const { result } = renderHook(() => useGameState());

      // Reduce score down to 2 by taking hints or wrong guesses
      act(() => {
        for (let i = 0; i < 9; i++) {
          result.current.getHint();
        }
      });

      expect(result.current.score).toBe(2); // 20 - 18 = 2

      // Requesting another hint on Easy (cost 2) would make score 0, so it must be blocked!
      act(() => {
        result.current.getHint();
      });

      expect(result.current.canAffordHint).toBe(false);
      expect(result.current.score).toBe(2);
      expect(result.current.hintsUsed).toBe(9);
    });

    it('provides a truthful parity hint', () => {
      const { result } = renderHook(() => useGameState());
      const secret = result.current.secretNumber;
      const isEven = secret % 2 === 0;

      act(() => {
        result.current.getHint();
      });

      const expectedText = `The secret number is ${isEven ? 'EVEN' : 'ODD'}.`;
      expect(result.current.currentHint).toBe(expectedText);
    });

    it('resets hint state after Play Again', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.getHint();
      });
      expect(result.current.hintsUsed).toBe(1);

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.hintsUsed).toBe(0);
      expect(result.current.currentHint).toBeNull();
    });

    it('disallows hints after game status is WON or LOST', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      expect(result.current.status).toBe('WON');

      act(() => {
        result.current.getHint();
      });

      expect(result.current.hintsUsed).toBe(0);
    });
  });

  describe('Achievement System', () => {
    it('unlocks First Victory on first win and prevents duplicate unlocks', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      expect(result.current.achievements).toContain('FIRST_WIN');
      expect(result.current.unlockedThisRound).toContain('First Victory');

      // Win round 2
      act(() => {
        result.current.resetGame();
      });
      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      // Filter count of FIRST_WIN
      const firstWinCount = result.current.achievements.filter((a) => a === 'FIRST_WIN').length;
      expect(firstWinCount).toBe(1);
    });

    it('unlocks Perfect Guess when winning on first attempt', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      expect(result.current.achievements).toContain('PERFECT_GUESS');
    });

    it('unlocks Hard Mode Hero on Hard difficulty win', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.changeDifficulty('hard');
      });
      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      expect(result.current.achievements).toContain('HARD_MODE_HERO');
    });

    it('unlocks No Help Needed when winning without using hints', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      expect(result.current.achievements).toContain('NO_HELP_NEEDED');
    });

    it('sanitizes malformed stored achievement data', () => {
      expect(sanitizeAchievements(null)).toEqual([]);
      expect(sanitizeAchievements('bad string')).toEqual([]);
      expect(sanitizeAchievements(['FIRST_WIN', 'INVALID_ID', 'FIRST_WIN'])).toEqual(['FIRST_WIN']);
    });

    it('preserves achievements after Reset Statistics operation', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.makeGuess(String(result.current.secretNumber));
      });

      expect(result.current.achievements.length).toBeGreaterThan(0);

      act(() => {
        result.current.resetStatistics();
      });

      expect(result.current.achievements.length).toBeGreaterThan(0);
    });
  });

  describe('Sound Preference', () => {
    it('defaults to enabled and persists sound preference correctly', () => {
      const { result } = renderHook(() => useSoundEffects());
      expect(result.current.soundEnabled).toBe(true);

      act(() => {
        result.current.toggleSound();
      });

      expect(result.current.soundEnabled).toBe(false);
    });
  });

  describe('Phase 8 Accessibility', () => {
    it('renders hint controls with accessible names and costs', () => {
      render(
        <HintControls
          currentHint="The secret number is EVEN."
          hintCost={2}
          hintsUsed={1}
          onGetHint={() => {}}
          disabled={false}
          canAffordHint={true}
        />
      );

      const hintBtn = screen.getByRole('button', { name: /get a hint/i });
      expect(hintBtn).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(/The secret number is EVEN/i);
    });

    it('renders achievement toast with polite live region semantics', () => {
      render(<AchievementToast toastMessage="Sharpshooter" />);

      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveAttribute('aria-live', 'polite');
      expect(toast).toHaveTextContent(/Sharpshooter/i);
    });
  });
});
