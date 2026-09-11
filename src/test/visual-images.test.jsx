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
    ['PLAYING', 'thinking', 'Thinking about the hidden number'],
    ['WON', 'win', 'Celebration after a correct guess'],
    ['LOST', 'loss', 'Game over'],
  ])('maps %s game state to local artwork', (status, state, alt) => {
    render(<SecretNumberDisplay status={status} secretNumber={19} />);
    expect(screen.getByAltText(alt)).toHaveAttribute('src', STATE_IMAGES[state]);
  });

  it('maps directional feedback images while preserving text', () => {
    const { rerender, container } = render(<GameStatusMessage message="Too High" maxNumber={20} proximity={{ level: 'almost', direction: 'high' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('ALMOST!');
    expect(container.querySelector('img')).toHaveAttribute('src', STATE_IMAGES.almost);
    rerender(<GameStatusMessage message="Too Low" maxNumber={20} proximity={{ level: 'low', direction: 'low' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('TOO LOW');
    expect(container.querySelector('img')).toHaveAttribute('src', STATE_IMAGES.low);
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
