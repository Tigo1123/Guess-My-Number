import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppImage } from '../components/AppImage';
import { SecretNumberDisplay } from '../components/SecretNumberDisplay';
import { GameStatusMessage } from '../components/GameStatusMessage';
import { DailyChallengePanel } from '../components/DailyChallengePanel';
import { Achievements } from '../components/Achievements';
import { ACHIEVEMENT_IMAGES, AVATAR_FALLBACK, AVATAR_IMAGES, CHALLENGE_IMAGES, STATE_IMAGES } from '../utils/imageAssets';

describe('visual image integration', () => {
  it('exposes the supplied avatar assets and fallback', () => {
    expect(AVATAR_IMAGES).toEqual(['/images/avatars/avatar-01.jpeg', '/images/avatars/avatar-02.jpeg']);
    expect(AVATAR_FALLBACK).toBe('/images/avatars/avatar-01.jpeg');
  });

  it('renders a safe fallback when an image fails', () => {
    render(<AppImage src="/missing.webp" fallbackSrc={AVATAR_FALLBACK} alt="Player avatar" />);
    const image = screen.getByAltText('Player avatar');
    fireEvent.error(image);
    expect(screen.getByAltText('Player avatar')).toHaveAttribute('src', AVATAR_FALLBACK);
  });

  it.each([
    ['WON', 'win', 'Celebration after a correct guess'],
    ['LOST', 'loss', 'Game over'],
  ])('maps %s game state to local artwork', (status, state, alt) => {
    render(<SecretNumberDisplay status={status} secretNumber={19} />);
    const image = screen.getByAltText(alt);
    expect(image).toHaveAttribute('src', STATE_IMAGES[state]);
    if (status === 'WON') expect(image).toHaveClass('result-card-background');
  });

  it('keeps the correct feedback row free of duplicate win artwork', () => {
    const { container } = render(<GameStatusMessage message="Correct Number" maxNumber={20} />);
    expect(container.querySelector('.correct-feedback img')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('CORRECT!');
  });

  it('does not render thinking artwork in the revealed-state component', () => {
    render(<SecretNumberDisplay status="PLAYING" secretNumber={19} />);
    expect(screen.queryByAltText('Thinking about the hidden number')).toBeNull();
    expect(screen.getByText('Guess the number')).toBeInTheDocument();
  });

  it('maps directional feedback images while preserving text', () => {
    const { rerender, container } = render(<GameStatusMessage message="Too High" maxNumber={20} proximity={{ level: 'almost', direction: 'high' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('ALMOST!');
    expect(container.querySelector('img')).toHaveAttribute('src', STATE_IMAGES.almost);
    rerender(<GameStatusMessage message="Too Low" maxNumber={20} proximity={{ level: 'low', direction: 'low' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('TOO LOW');
    expect(container.querySelector('img')).toHaveAttribute('src', STATE_IMAGES.low);
  });

  it('restarts the feedback card for repeated wrong guesses and keeps its live message', () => {
    const props = { message: 'Too High', maxNumber: 20, proximity: { level: 'almost', direction: 'high' } };
    const { rerender, container } = render(<GameStatusMessage {...props} feedbackToken={1} />);
    const first = screen.getByRole('status');
    expect(container.querySelector('.feedback-artwork img')).toHaveAttribute('src', STATE_IMAGES.almost);
    rerender(<GameStatusMessage {...props} feedbackToken={2} />);
    expect(screen.getByRole('status')).not.toBe(first);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('status')).toHaveTextContent('Just a little too high');
  });

  it('keeps the loss title and secret readable if artwork fails', () => {
    render(<SecretNumberDisplay status="LOST" secretNumber={19} />);
    fireEvent.error(screen.getByAltText('Game over'));
    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getByText('Game over — secret number was')).toBeInTheDocument();
  });

  it('renders daily challenge artwork with meaningful alt text', () => {
    render(<DailyChallengePanel todayKey="2026-09-11" dailyChallengeConfig={{ difficulty: 'easy', mode: 'classic' }} dailyStreak={{ current: 0, best: 0 }} imageSrc={CHALLENGE_IMAGES.daily} />);
    expect(screen.getByAltText('Daily Challenge illustration')).toHaveAttribute('src', CHALLENGE_IMAGES.daily);
  });

  it('keeps achievement artwork mapped centrally', () => {
    render(<Achievements unlockedAchievements={['ON_FIRE']} history={[]} streak={0} />);
    expect(screen.getByAltText('Hot Streak achievement badge')).toHaveAttribute('src', ACHIEVEMENT_IMAGES.ON_FIRE);
    expect(screen.getByText('Hot Streak')).toBeInTheDocument();
  });

  it('marks decorative feedback artwork as ignored by assistive technology', () => {
    const { container } = render(<GameStatusMessage message="Too High" maxNumber={20} proximity={{ level: 'high', direction: 'high' }} />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(container.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
  });
});
