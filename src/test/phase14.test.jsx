import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RoundSummary } from '../components/RoundSummary';
import { generateShareText } from '../utils/shareResult';

const round = { status: 'WON', difficultyName: 'Medium', gameMode: 'classic', attempts: 4, score: 12, streak: 3 };
const expected = 'Guess My Number 🎯\nMedium • Classic\nWon in 4 attempts\nScore: 12\n🔥 Streak: 3';
function api(clipboard, share) {
  vi.spyOn(window, 'navigator', 'get').mockReturnValue({ clipboard, share });
}
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

describe('Phase 14 share text', () => {
  it('formats a win with difficulty, mode, attempts, score and streak', () => {
    expect(generateShareText(round)).toBe(expected);
  });
  it('formats a loss without score or streak', () => {
    expect(generateShareText({ ...round, status: 'LOST', difficultyName: 'Hard', gameMode: 'limited', attempts: 5 }))
      .toBe('Guess My Number 🎯\nHard • Limited Attempts\nGame over\nAttempts: 5\nBetter luck next round!');
  });
  it.each(['classic', 'timed', 'limited'])('supports wins and losses in %s', (gameMode) => {
    const labels = { classic: 'Classic', timed: 'Timed Challenge', limited: 'Limited Attempts' };
    for (const status of ['WON', 'LOST']) expect(generateShareText({ ...round, gameMode, status })).toContain(`Medium • ${labels[gameMode]}`);
  });
  it.each(['WON', 'LOST'])('includes a deterministic daily date for %s', (status) => {
    expect(generateShareText({ ...round, status, isDailyChallengeActive: true, todayKey: '2026-09-09' }))
      .toContain('Daily Challenge\nSeptember 9, 2026\n');
  });
  it('labels daily practice accurately', () => {
    expect(generateShareText({ ...round, isDailyChallengeActive: true, isPracticeReplay: true })).toContain('Practice Replay');
  });
  it('omits unavailable data and private fields', () => {
    expect(generateShareText({ status: 'WON', secretNumber: 99, playerName: 'Private', profileId: 'internal' })).toBe('Guess My Number 🎯\nWon');
  });
  it('preserves zero score and uses singular attempt', () => {
    expect(generateShareText({ ...round, attempts: 1, score: 0 })).toContain('Won in 1 attempt\nScore: 0');
  });
  it('does not share an unfinished round', () => expect(generateShareText({ ...round, status: 'PLAYING' })).toBe(''));
});

describe('Phase 14 completed-round controls', () => {
  it('copies exact text and announces success before resetting the label', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue();
    api({ writeText });
    render(<RoundSummary {...round} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy Result' })));
    expect(writeText).toHaveBeenCalledExactlyOnceWith(expected);
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Copied!');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    act(() => vi.advanceTimersByTime(2500));
    expect(screen.getByRole('button', { name: 'Copy Result' })).toBeInTheDocument();
  });
  it.each(['unavailable', 'rejected'])('handles %s clipboard', async (kind) => {
    api(kind === 'unavailable' ? undefined : { writeText: vi.fn().mockRejectedValue(new Error('denied')) });
    render(<RoundSummary {...round} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy Result' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/unavailable|Could not copy/));
  });
  it('shares the exact native payload without a URL', async () => {
    const share = vi.fn().mockResolvedValue();
    api(undefined, share);
    render(<RoundSummary {...round} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Share Result' })));
    expect(share).toHaveBeenCalledExactlyOnceWith({ title: 'Guess My Number', text: expected });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('hides native sharing when unavailable', () => {
    api(undefined);
    render(<RoundSummary {...round} />);
    expect(screen.queryByRole('button', { name: 'Share Result' })).not.toBeInTheDocument();
  });
  it('silently handles cancelled sharing', async () => {
    api(undefined, vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')));
    render(<RoundSummary {...round} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Share Result' })));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('button', { name: 'Share Result' })).toBeEnabled();
  });
  it('offers copy after other sharing errors', async () => {
    api(undefined, vi.fn().mockRejectedValue(new Error('failed')));
    render(<RoundSummary {...round} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Share Result' })));
    expect(screen.getByRole('status')).toHaveTextContent('Could not share. Try Copy Result.');
  });
  it('resets feedback when a round changes and hides controls during play', async () => {
    api({ writeText: vi.fn().mockResolvedValue() });
    const { rerender } = render(<RoundSummary {...round} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy Result' })));
    rerender(<RoundSummary {...round} status="PLAYING" />);
    expect(screen.queryByRole('button', { name: 'Copied!' })).not.toBeInTheDocument();
    rerender(<RoundSummary {...round} status="LOST" />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('keeps a single set of controls and single invocation after resizing', async () => {
    const writeText = vi.fn().mockResolvedValue();
    api({ writeText }, vi.fn());
    render(<RoundSummary {...round} />);
    for (const width of [320, 360, 375, 390, 430, 1440]) {
      vi.stubGlobal('innerWidth', width);
      fireEvent(window, new Event('resize'));
      expect(screen.getAllByRole('button', { name: 'Copy Result' })).toHaveLength(1);
      expect(screen.getAllByRole('button', { name: 'Share Result' })).toHaveLength(1);
    }
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy Result' })));
    expect(writeText).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
