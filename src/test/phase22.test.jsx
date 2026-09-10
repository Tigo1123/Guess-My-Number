import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { App } from '../App';
import { useGameState } from '../hooks/useGameState';
import { generateShareText } from '../utils/shareResult';

describe('Phase 22 Endless Streak mode', () => {
  beforeEach(() => localStorage.clear());

  it('appears in the mode selector and starts a fresh round-one run', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.changeGameMode('endless'));
    expect(result.current.gameMode).toBe('endless');
    expect(result.current.endlessRun).toMatchObject({ active: true, roundsWon: 0, currentRound: 1, totalGuesses: 0 });
    expect(result.current.attempts).toBe(0);
  });
  it('supports a winning round transition and resets round state while preserving streak', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.changeGameMode('endless'));
    const firstSecret = result.current.secretNumber;
    act(() => result.current.makeGuess(String(firstSecret)));
    expect(result.current.status).toBe('WON');
    expect(result.current.endlessRun.roundsWon).toBe(1);
    expect(result.current.gameHistory.at(-1)).toMatchObject({ mode: 'endless', endlessRound: 1, endlessStreak: 1 });
    act(() => result.current.advanceEndlessRound());
    expect(result.current.status).toBe('PLAYING');
    expect(result.current.endlessRun).toMatchObject({ active: true, roundsWon: 1, currentRound: 2, totalGuesses: 1 });
    expect(result.current.attempts).toBe(0);
    expect(result.current.guessHistory).toHaveLength(0);
    expect(result.current.hintsUsed).toBe(0);
  });
  it.each([['easy', 6], ['medium', 7], ['hard', 8]])('ends a %s run after its configured attempts', (difficulty, limit) => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.changeDifficulty(difficulty));
    act(() => result.current.changeGameMode('endless'));
    let guess = 1;
    for (let i = 0; i < limit && result.current.status === 'PLAYING'; i += 1) {
      if (guess === result.current.secretNumber) guess += 1;
      act(() => result.current.makeGuess(String(guess)));
      guess += 1;
    }
    expect(result.current.status).toBe('LOST');
    expect(result.current.endlessRun.active).toBe(false);
    expect(result.current.attempts).toBe(limit);
  });
  it('persists best streak per profile and does not replace it with a worse run', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.changeGameMode('endless'));
    act(() => result.current.makeGuess(String(result.current.secretNumber)));
    expect(result.current.bestEndlessStreak).toBe(1);
    act(() => result.current.restartGame());
    expect(result.current.endlessRun.roundsWon).toBe(0);
    expect(result.current.bestEndlessStreak).toBe(1);
  });
  it('restarts Endless safely and keeps the existing modes available', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.changeGameMode('endless'));
    act(() => result.current.restartGame());
    expect(result.current.endlessRun).toMatchObject({ active: true, roundsWon: 0, currentRound: 1 });
    act(() => result.current.changeGameMode('classic'));
    expect(result.current.gameMode).toBe('classic');
    expect(result.current.endlessRun.active).toBe(false);
  });
  it('shares an Endless result without secret or run identifiers', () => {
    const text = generateShareText({ status: 'LOST', difficultyName: 'Medium', gameMode: 'endless', endlessRoundsWon: 7, endlessBestStreak: 9, endlessTotalGuesses: 34, attempts: 7 });
    expect(text).toContain('Endless Streak');
    expect(text).toContain('Rounds Won: 7');
    expect(text).toContain('Best Streak: 9');
    expect(text).toContain('Total Guesses: 34');
    expect(text).not.toContain('secret');
    expect(text).not.toContain('runId');
  });
  it('renders the Endless selector and readable attempts status', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Endless/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Endless/i }));
    expect(screen.getByLabelText('Attempts Remaining')).toHaveTextContent('6');
    expect(screen.getByLabelText('Endless Streak Status')).toHaveTextContent('Round 1');
  });
});
