import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';
import { Header } from '../components/Header';
import { SecretNumberDisplay } from '../components/SecretNumberDisplay';
import { GuessForm } from '../components/GuessForm';
import { ScoreBoard } from '../components/ScoreBoard';
import { LocalLeaderboard } from '../components/LocalLeaderboard';

describe('Phase 13 — Minimal & Premium UI/UX Redesign Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Minimal Shell & Header', () => {
    it('renders centered terminal shell container', () => {
      const { container } = render(<App />);
      expect(container.querySelector('.terminal')).toBeInTheDocument();
    });

    it('renders clean brand title without terminal brackets or glows', () => {
      render(<Header />);
      expect(screen.getByRole('heading', { name: /^Guess My Number$/i })).toBeInTheDocument();
    });

    it('renders active player indicator avatar initial circle', () => {
      const { container } = render(<App />);
      const avatarCircle = container.querySelector('.avatar-circle');
      expect(avatarCircle).toBeInTheDocument();
      expect(avatarCircle).toHaveTextContent(/[A-Z]/);
    });
  });

  describe('2. Navigation Tabs (No Emojis)', () => {
    it('renders clean plain-text navigation tabs', () => {
      render(<App />);
      expect(screen.getByRole('tab', { name: /^Play$/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^Stats$/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^History$/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^Players$/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /^Settings$/i })).toBeInTheDocument();
    });

    it('switches navigation tab when clicked', () => {
      render(<App />);
      const statsTab = screen.getByRole('tab', { name: /^Stats$/i });
      fireEvent.click(statsTab);
      expect(statsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('3. PLAY Screen Components & Metrics', () => {
    it('renders secret number hero card with minimal box', () => {
      const { container } = render(
        <SecretNumberDisplay status="PLAYING" secretNumber={42} />
      );
      expect(container.querySelector('.secret-number-container')).toBeInTheDocument();
      expect(container.querySelector('.secret-circle')).toHaveTextContent('?');
    });

    it('renders clean guess form with plain Check button label', () => {
      render(
        <GuessForm
          guessInput=""
          onGuessChange={() => {}}
          onSubmitGuess={() => {}}
          disabled={false}
          isInvalid={false}
          resetToken={0}
        />
      );
      expect(screen.getByLabelText(/guess a number/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Check$/i })).toBeInTheDocument();
    });

    it('renders metrics grid with clean score labels', () => {
      render(<ScoreBoard score={20} highScore={50} attempts={3} />);
      expect(screen.getByText('Score')).toBeInTheDocument();
      expect(screen.getByText('Best')).toBeInTheDocument();
      expect(screen.getByText('Attempts')).toBeInTheDocument();
    });
  });

  describe('4. Leaderboard Numerical Ranks (No Medal Emojis)', () => {
    it('renders clean numerical rank numbers without medal emojis', () => {
      const p1 = { id: 'p1', name: 'Taj', progress: { statistics: { totalGames: 5, totalWins: 5 } } };
      const p2 = { id: 'p2', name: 'Alex', progress: { statistics: { totalGames: 5, totalWins: 3 } } };

      render(<LocalLeaderboard profiles={[p1, p2]} activeProfileId="p1" />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.queryByText(/🥇/)).not.toBeInTheDocument();
    });
  });

  describe('5. 2-Column PLAY Grid & Control Resets', () => {
    it('renders 2-column layout grid on PLAY tab', () => {
      const { container } = render(<App />);
      const grid = container.querySelector('.play-layout-grid');
      expect(grid).toBeInTheDocument();
      expect(container.querySelector('.game-board-column')).toBeInTheDocument();
      expect(container.querySelector('.sidebar-column')).toBeInTheDocument();
    });
  });
});
