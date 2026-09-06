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
  }, [resetToken]); // Listens ONLY to resetToken, not every guess!

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled) {
      onSubmitGuess(guessInput);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="guess-form-wrapper" noValidate>
      <div className="input-box">
        <label htmlFor="guess-input" className="sr-only">
          Guess a number
        </label>
        <input
          id="guess-input"
          ref={inputRef}
          type="number"
          className={`guess ${isInvalid ? 'invalid' : ''}`}
          placeholder="Type a number..."
          value={guessInput}
          onChange={(e) => onGuessChange(e.target.value)}
          disabled={disabled}
          aria-invalid={isInvalid}
          autoComplete="off"
        />
      </div>

      <button type="submit" className="check" disabled={disabled}>
        Check
      </button>
    </form>
  );
}
