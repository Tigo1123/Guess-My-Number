import React, { useRef, useEffect } from 'react';

export function GuessForm({
  guessInput,
  onGuessChange,
  onSubmitGuess,
  disabled,
  isInvalid,
  resetToken,
}) {
  const inputRef = useRef(null);

  // Auto-focus input only on initial load, Play Again, or difficulty change
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [resetToken, disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled) {
      onSubmitGuess(guessInput);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="guess-form" noValidate>
      <div className="input-row">
        <label htmlFor="guess-input" className="sr-only">
          Guess a number
        </label>
        <input
          id="guess-input"
          ref={inputRef}
          type="number"
          className={`guess-input ${isInvalid ? 'invalid' : ''}`}
          placeholder="Enter your guess..."
          value={guessInput}
          onChange={(e) => onGuessChange(e.target.value)}
          disabled={disabled}
          aria-invalid={isInvalid}
          autoComplete="off"
        />
        <button type="submit" className="btn-check-guess btn-primary" disabled={disabled}>
          Check
        </button>
      </div>
    </form>
  );
}
