import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

describe('Gameplay Engine', () => {
  it('processes valid guess and increments counters appropriately', () => {
    const { result } = renderHook(() => useGameState());
    const secret = result.current.secretNumber;
    // Choose a valid wrong guess
    const wrongGuess = secret === 1 ? 2 : 1;

    act(() => {
      result.current.makeGuess(String(wrongGuess));
    });

    expect(result.current.attempts).toBe(1);
    expect(result.current.guessHistory).toHaveLength(1);
    expect(result.current.guessHistory[0].guess).toBe(wrongGuess);
    expect(result.current.statistics.totalValidGuesses).toBe(1);

    if (wrongGuess > secret) {
      expect(result.current.message).toBe('📉 Too High');
      expect(result.current.guessHistory[0].result).toBe('Too High');
    } else {
      expect(result.current.message).toBe('📈 Too Low');
      expect(result.current.guessHistory[0].result).toBe('Too Low');
    }
  });

  it('handles winning flow and updates difficulty high scores and statistics', () => {
    const { result } = renderHook(() => useGameState());
    const secret = result.current.secretNumber;

    act(() => {
      result.current.makeGuess(String(secret));
    });

    expect(result.current.status).toBe('WON');
    expect(result.current.message).toBe('🎉 Correct Number!');
    expect(result.current.attempts).toBe(1);
    expect(result.current.guessHistory[0].result).toBe('Correct');
    expect(result.current.highScore).toBe(20); // Starting score on Easy

    // Lifetime statistics check
    expect(result.current.statistics.totalGames).toBe(1);
    expect(result.current.statistics.totalWins).toBe(1);
    expect(result.current.statistics.totalLosses).toBe(0);
    expect(result.current.statistics.byDifficulty.easy.games).toBe(1);
    expect(result.current.statistics.byDifficulty.easy.wins).toBe(1);
  });

  it('handles loss flow when score reaches 0', () => {
    const { result } = renderHook(() => useGameState());

    // Easy mode starting score is 20: make 20 sequential wrong guesses
    for (let i = 0; i < 20; i++) {
      const currentSecret = result.current.secretNumber;
      const wrongGuess = currentSecret === 1 ? 2 : 1;
      act(() => {
        result.current.makeGuess(String(wrongGuess));
      });
    }

    expect(result.current.score).toBe(0);
    expect(result.current.status).toBe('LOST');
    expect(result.current.message).toBe('💀 Game Over!');
    expect(result.current.statistics.totalGames).toBe(1);
    expect(result.current.statistics.totalWins).toBe(0);
    expect(result.current.statistics.totalLosses).toBe(1);
    expect(result.current.statistics.byDifficulty.easy.games).toBe(1);
    expect(result.current.statistics.byDifficulty.easy.losses).toBe(1);
  });

  it('REGRESSION TEST: prevents duplicate completion counting on finished games', () => {
    const { result } = renderHook(() => useGameState());
    const secret = result.current.secretNumber;

    // Finish game with a win
    act(() => {
      result.current.makeGuess(String(secret));
    });

    expect(result.current.statistics.totalGames).toBe(1);
    expect(result.current.statistics.totalWins).toBe(1);

    // Attempting further guesses on WON state must be blocked and NOT increment stats
    act(() => {
      result.current.makeGuess(String(secret));
    });
    act(() => {
      result.current.makeGuess('5');
    });

    expect(result.current.statistics.totalGames).toBe(1);
    expect(result.current.statistics.totalWins).toBe(1);
  });
});
