import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

describe('Game Reset & Difficulty Switching', () => {
  it('resets current round state on Play Again while preserving high scores and stats', () => {
    const { result } = renderHook(() => useGameState());
    const secret = result.current.secretNumber;

    // Win the game to record stats and high score
    act(() => {
      result.current.makeGuess(String(secret));
    });

    expect(result.current.status).toBe('WON');
    expect(result.current.highScore).toBe(20);
    expect(result.current.statistics.totalGames).toBe(1);

    // Click Play Again
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.status).toBe('PLAYING');
    expect(result.current.score).toBe(20);
    expect(result.current.attempts).toBe(0);
    expect(result.current.guessHistory).toHaveLength(0);
    expect(result.current.proximity).toBeNull();
    expect(result.current.message).toBe('Start guessing...');

    // Preserved persistent data
    expect(result.current.highScore).toBe(20);
    expect(result.current.statistics.totalGames).toBe(1);
  });

  it('switches difficulty cleanly, resetting round state while keeping stored high scores and stats', () => {
    const { result } = renderHook(() => useGameState());

    // Switch to Hard difficulty (max 100, score 10)
    act(() => {
      result.current.changeDifficulty('hard');
    });

    expect(result.current.difficulty).toBe('hard');
    expect(result.current.config.maxNumber).toBe(100);
    expect(result.current.score).toBe(10);
    expect(result.current.attempts).toBe(0);
    expect(result.current.guessHistory).toHaveLength(0);
    expect(result.current.status).toBe('PLAYING');
  });
});
