import React, { useRef, useEffect, useState } from 'react';

export function GuessForm({
  guessInput,
  onGuessChange,
  onSubmitGuess,
  disabled,
  isInvalid,
  resetToken,
  feedbackToken = 0,
}) {
  const inputRef = useRef(null);
  const [shake, setShake] = useState(false);

  // Auto-focus input only on initial load, Play Again, or difficulty change
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [resetToken, disabled]);

  useEffect(() => {
    if (!feedbackToken || disabled) return undefined;
    setShake(false);
    const frame = window.setTimeout(() => setShake(true), 0);
    const timer = window.setTimeout(() => setShake(false), 280);
    return () => { window.clearTimeout(frame); window.clearTimeout(timer); };
  }, [feedbackToken, disabled]);

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
          className={`guess-input ${isInvalid ? 'invalid' : ''} ${shake ? 'wrong-guess-shake' : ''}`}
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
