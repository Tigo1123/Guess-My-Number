import React from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../App';
import { calculateDifficultyStats, calculateModeStats, calculatePlayerAnalytics, calculateRecentPerformance, generatePlayerInsight } from '../utils/analytics';

const games = [
  { id: '1', result: 'WIN', difficulty: 'easy', mode: 'classic', attempts: 3 },
  { id: '2', result: 'LOSS', difficulty: 'easy', mode: 'timed', attempts: 5 },
  { id: '3', result: 'WIN', difficulty: 'medium', mode: 'classic', attempts: 4 },
  { id: '4', result: 'WIN', difficulty: 'medium', mode: 'limited', attempts: 2 },
  { id: '5', result: 'LOSS', difficulty: 'hard', mode: 'limited', attempts: 6 },
  { id: '6', result: 'WIN', difficulty: 'medium', mode: 'classic', attempts: 4 },
];

describe('Phase 15 analytics utilities', () => {
  it('handles empty history without undefined, NaN, or Infinity', () => {
    const result = calculatePlayerAnalytics([]);
    expect(result.totalGames).toBe(0);
    expect(JSON.stringify(result)).not.toMatch(/NaN|Infinity|undefined/);
    expect(generatePlayerInsight(result)).toMatch(/Play more games/);
  });
  it('calculates average attempts and overall win rate', () => {
    const result = calculatePlayerAnalytics(games);
    expect(result.averageAttempts).toBe(4);
    expect(result.winRate).toBe(67);
  });
  it('selects best and most played difficulty deterministically', () => {
    const result = calculatePlayerAnalytics(games);
    expect(result.bestDifficulty).toBe('medium');
    expect(result.mostPlayedDifficulty).toBe('medium');
  });
  it('selects most played mode and calculates mode win rate', () => {
    const result = calculatePlayerAnalytics(games);
    expect(result.mostPlayedMode).toBe('classic');
    expect(result.modeStats.classic.winRate).toBe(100);
  });
  it('calculates wins and losses by difficulty', () => {
    const result = calculateDifficultyStats(games);
    expect(result.easy).toMatchObject({ games: 2, wins: 1, losses: 1 });
    expect(result.hard).toMatchObject({ games: 1, wins: 0, losses: 1 });
  });
  it('calculates difficulty average attempts', () => {
    expect(calculateDifficultyStats(games).medium.averageAttempts).toBe(3.3);
  });
  it('calculates last ten win rate and limits recent performance', () => {
    const history = Array.from({ length: 12 }, (_, index) => ({ id: String(index), result: index < 2 ? 'LOSS' : 'WIN', difficulty: 'easy', mode: 'classic', attempts: 1 }));
    const result = calculatePlayerAnalytics(history);
    expect(result.recent).toHaveLength(10);
    expect(result.recentWinRate).toBe(100);
    expect(calculateRecentPerformance(history)[0].id).toBe('11');
  });
  it('supports one game, all wins, and all losses', () => {
    expect(calculatePlayerAnalytics([games[0]])).toMatchObject({ totalGames: 1, winRate: 100, currentStreak: 1, bestStreak: 1 });
    expect(calculatePlayerAnalytics(games.filter((g) => g.result === 'WIN')).totalLosses).toBe(0);
    expect(calculatePlayerAnalytics(games.filter((g) => g.result === 'LOSS')).totalWins).toBe(0);
  });
  it('handles missing optional and imported legacy fields', () => {
    const result = calculatePlayerAnalytics([{ result: 'WIN', difficulty: 'easy' }, { result: 'LOSS', mode: 'classic' }]);
    expect(result.totalGames).toBe(2);
    expect(result.averageAttempts).toBeNull();
    expect(result.modeStats.classic.games).toBe(1);
  });
  it('classifies daily records separately', () => {
    const result = calculateModeStats([{ result: 'WIN', mode: 'classic', isDailyChallenge: true }]);
    expect(result.daily).toMatchObject({ games: 1, wins: 1, winRate: 100 });
    expect(result.classic.games).toBe(0);
  });
  it('tracks current and best streaks', () => {
    const result = calculatePlayerAnalytics([{ result: 'WIN' }, { result: 'WIN' }, { result: 'LOSS' }, { result: 'WIN' }]);
    expect(result).toMatchObject({ currentStreak: 1, bestStreak: 2 });
  });
  it('generates deterministic insights', () => {
    const result = calculatePlayerAnalytics(games);
    expect(generatePlayerInsight(result)).toBe('Your strongest difficulty is Medium.');
    expect(generatePlayerInsight({ ...result, recent: [{ outcome: 'Win' }, { outcome: 'Win' }], recentWinRate: 100, winRate: 50 })).toMatch(/improved/);
  });
  it('returns empty mode stats safely for invalid input', () => {
    expect(calculateModeStats(null).daily.games).toBe(0);
  });
  it('calculates mode losses and zero win rate', () => {
    expect(calculateModeStats([{ result: 'LOSS', mode: 'timed' }]).timed).toMatchObject({ games: 1, wins: 0, winRate: 0 });
  });
  it('uses a stable tie break for equally played categories', () => {
    const result = calculatePlayerAnalytics([{ result: 'WIN', difficulty: 'hard', mode: 'limited' }, { result: 'WIN', difficulty: 'easy', mode: 'classic' }]);
    expect(result.mostPlayedDifficulty).toBe('easy');
    expect(result.mostPlayedMode).toBe('classic');
  });
});

describe('Phase 15 analytics UI', () => {
  beforeEach(() => localStorage.clear());
  it('renders analytics sections and empty states on the Stats page', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Stats' }));
    expect(screen.getByRole('region', { name: 'Advanced Player Analytics' })).toBeInTheDocument();
    expect(screen.getByText('Recent Performance')).toBeInTheDocument();
    expect(screen.getByText('Difficulty Performance')).toBeInTheDocument();
    expect(screen.getByText('Game Mode Performance')).toBeInTheDocument();
    expect(screen.getByText(/Play more games/)).toBeInTheDocument();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });
  it('renders all difficulty rows with readable no-data values', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Stats' }));
    for (const label of ['Easy', 'Medium', 'Hard']) expect(screen.getAllByText(label, { selector: 'span' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
  it('does not expose analytics from another profile', () => {
    const payload = { version: 1, activeProfileId: 'p1', profiles: [
      { id: 'p1', name: 'One', progress: { gameHistory: [{ id: 'a', result: 'WIN', difficulty: 'hard', mode: 'timed', attempts: 1 }] } },
      { id: 'p2', name: 'Two', progress: { gameHistory: [{ id: 'b', result: 'LOSS', difficulty: 'easy', mode: 'classic', attempts: 9 }] } },
    ] };
    localStorage.setItem('guess_my_number_profiles', JSON.stringify(payload));
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Stats' }));
    const analytics = screen.getByRole('region', { name: 'Advanced Player Analytics' });
    expect(within(analytics).getByText('Best Difficulty').nextElementSibling).toHaveTextContent('Hard');
  });
  it('keeps current stats navigation available', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Stats' }));
    expect(screen.getByText('Lifetime Statistics')).toBeInTheDocument();
    expect(screen.getByText('Personal Records')).toBeInTheDocument();
  });
  it('keeps analytics controls as one readable panel at the UI level', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Stats' }));
    expect(screen.getAllByRole('region', { name: 'Advanced Player Analytics' })).toHaveLength(1);
    expect(screen.getByText('Current Win Rate')).toBeInTheDocument();
  });
});
