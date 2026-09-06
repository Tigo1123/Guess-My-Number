import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

describe('Reset Statistics Operation', () => {
  it('resets lifetime statistics to zero while preserving active high scores and active round state', () => {
    const { result } = renderHook(() => useGameState());
    const secret = result.current.secretNumber;

    // Play a game to record high score and statistics
    act(() => {
      result.current.makeGuess(String(secret));
    });

    expect(result.current.statistics.totalGames).toBe(1);
    expect(result.current.highScore).toBe(20);

    // Reset statistics
    act(() => {
      result.current.resetStatistics();
    });

    expect(result.current.statistics.totalGames).toBe(0);
    expect(result.current.statistics.totalWins).toBe(0);
    expect(result.current.statistics.totalLosses).toBe(0);
    expect(result.current.statistics.totalValidGuesses).toBe(0);

    // Preserved active state & high scores
    expect(result.current.highScore).toBe(20);
    expect(result.current.status).toBe('WON');
  });
});
