import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';
import { GuessForm } from '../components/GuessForm';
import { DifficultySelector } from '../components/DifficultySelector';
import { GameStatusMessage } from '../components/GameStatusMessage';

describe('Accessibility Smoke Tests', () => {
  it('renders guess input with an accessible label', () => {
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

    const input = screen.getByLabelText(/guess a number/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('sets aria-invalid on input when validation fails', () => {
    render(
      <GuessForm
        guessInput="abc"
        onGuessChange={() => {}}
        onSubmitGuess={() => {}}
        disabled={false}
        isInvalid={true}
        resetToken={0}
      />
    );

    const input = screen.getByLabelText(/guess a number/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies aria-pressed on difficulty buttons to indicate active state', () => {
    render(
      <DifficultySelector
        activeDifficulty="medium"
        onSelectDifficulty={() => {}}
      />
    );

    const mediumBtn = screen.getByRole('button', { name: 'Medium' });
    const easyBtn = screen.getByRole('button', { name: 'Easy' });

    expect(mediumBtn).toHaveAttribute('aria-pressed', 'true');
    expect(easyBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders status message with role="status" and aria-live="polite"', () => {
    render(
      <GameStatusMessage
        message="Start guessing..."
        maxNumber={20}
      />
    );

    const statusEl = screen.getByRole('status');
    expect(statusEl).toHaveTextContent('Start guessing...');
    expect(statusEl).toHaveAttribute('aria-live', 'polite');
  });
});
