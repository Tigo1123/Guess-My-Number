import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

describe('Guess Input Validation', () => {
  it('rejects empty guess without altering game state', () => {
    const { result } = renderHook(() => useGameState());
    const initialScore = result.current.score;

    act(() => {
      result.current.makeGuess('');
    });

    expect(result.current.message).toBe('⛔ No Number');
    expect(result.current.isInvalid).toBe(true);
    expect(result.current.score).toBe(initialScore);
    expect(result.current.attempts).toBe(0);
    expect(result.current.guessHistory).toHaveLength(0);
    expect(result.current.statistics.totalValidGuesses).toBe(0);
  });

  it('rejects non-numeric string input without altering game state', () => {
    const { result } = renderHook(() => useGameState());
    const initialScore = result.current.score;

    act(() => {
      result.current.makeGuess('abc');
    });

    expect(result.current.message).toBe('⛔ Enter a valid integer');
    expect(result.current.isInvalid).toBe(true);
    expect(result.current.score).toBe(initialScore);
    expect(result.current.attempts).toBe(0);
    expect(result.current.guessHistory).toHaveLength(0);
    expect(result.current.statistics.totalValidGuesses).toBe(0);
  });

  it('rejects decimal input without altering game state', () => {
    const { result } = renderHook(() => useGameState());
    const initialScore = result.current.score;

    act(() => {
      result.current.makeGuess('12.5');
    });

    expect(result.current.message).toBe('⛔ Enter a valid integer');
    expect(result.current.isInvalid).toBe(true);
    expect(result.current.score).toBe(initialScore);
    expect(result.current.attempts).toBe(0);
    expect(result.current.guessHistory).toHaveLength(0);
    expect(result.current.statistics.totalValidGuesses).toBe(0);
  });

  it('rejects guess below 1 without altering game state', () => {
    const { result } = renderHook(() => useGameState());
    const initialScore = result.current.score;

    act(() => {
      result.current.makeGuess('0');
    });

    expect(result.current.message).toBe('⛔ Number must be between 1 and 20');
    expect(result.current.isInvalid).toBe(true);
    expect(result.current.score).toBe(initialScore);
    expect(result.current.attempts).toBe(0);
    expect(result.current.guessHistory).toHaveLength(0);
    expect(result.current.statistics.totalValidGuesses).toBe(0);
  });

  it('rejects guess above maximum without altering game state', () => {
    const { result } = renderHook(() => useGameState());
    const initialScore = result.current.score;

    act(() => {
      result.current.makeGuess('999');
    });

    expect(result.current.message).toBe('⛔ Number must be between 1 and 20');
    expect(result.current.isInvalid).toBe(true);
    expect(result.current.score).toBe(initialScore);
    expect(result.current.attempts).toBe(0);
    expect(result.current.guessHistory).toHaveLength(0);
    expect(result.current.statistics.totalValidGuesses).toBe(0);
  });
});
