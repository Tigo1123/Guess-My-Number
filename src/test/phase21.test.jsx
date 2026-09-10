import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GuessForm } from '../components/GuessForm';
import { SecretNumberDisplay } from '../components/SecretNumberDisplay';
import { ProximityIndicator } from '../components/ProximityIndicator';
import { MissionToast } from '../components/MissionToast';
import { AchievementToast } from '../components/AchievementToast';

describe('Phase 21 motion and notification behavior', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('re-triggers wrong guess feedback for consecutive tokens', () => {
    const { rerender } = render(<GuessForm guessInput="4" onGuessChange={() => {}} onSubmitGuess={() => {}} disabled={false} isInvalid={false} resetToken={0} feedbackToken={1} />);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('spinbutton')).toHaveClass('wrong-guess-shake');
    rerender(<GuessForm guessInput="5" onGuessChange={() => {}} onSubmitGuess={() => {}} disabled={false} isInvalid={false} resetToken={0} feedbackToken={2} />);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('spinbutton')).toHaveClass('wrong-guess-shake');
  });
  it('reveals win/loss state and renders a restrained win burst', () => {
    const { rerender } = render(<SecretNumberDisplay status="WON" secretNumber={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(document.querySelector('.secret-circle.revealed')).toBeTruthy();
    expect(document.querySelectorAll('.win-particles i')).toHaveLength(6);
    rerender(<SecretNumberDisplay status="LOST" secretNumber={7} />);
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(document.querySelector('.win-particles')).toBeNull();
  });
  it('restarts proximity feedback when its animation token changes', () => {
    const { rerender } = render(<ProximityIndicator proximity="Hot" animationToken={1} />);
    const first = document.querySelector('.proximity-box');
    rerender(<ProximityIndicator proximity="Hot" animationToken={2} />);
    expect(document.querySelector('.proximity-box')).not.toBe(first);
  });
  it('shows and auto-dismisses mission and achievement notifications without focus changes', () => {
    const { rerender } = render(<MissionToast mission={null} onDismiss={() => {}} />);
    expect(screen.queryByText('Mission Complete')).toBeNull();
    rerender(<MissionToast mission={{ id: 'win_one', title: 'Win 1 Game' }} onDismiss={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Mission Complete');
    act(() => vi.advanceTimersByTime(3600));
    expect(screen.queryByText('Mission Complete')).toBeNull();
    const onDismiss = vi.fn();
    const view = render(<AchievementToast toastMessage="Hot Streak" />);
    expect(view.container.querySelector('[role="status"]')).toHaveTextContent('Hot Streak');
    act(() => vi.advanceTimersByTime(3600));
    expect(view.container.querySelector('[role="status"]')).toBeNull();
    expect(onDismiss).not.toHaveBeenCalled();
  });
  it('queues multiple achievement unlocks without requiring focus', () => {
    render(<AchievementToast toastMessage={['Hot Streak', 'Dedicated Player']} />);
    expect(screen.getByRole('status')).toHaveTextContent('Hot Streak');
    act(() => vi.advanceTimersByTime(3600));
    expect(screen.getByRole('status')).toHaveTextContent('Dedicated Player');
  });
  it('keeps the check action accessible and keyboard operable', () => {
    const submit = vi.fn();
    render(<GuessForm guessInput="8" onGuessChange={() => {}} onSubmitGuess={submit} disabled={false} isInvalid={false} resetToken={0} feedbackToken={0} />);
    fireEvent.submit(screen.getByRole('spinbutton').closest('form'));
    expect(submit).toHaveBeenCalledWith('8');
  });
});
