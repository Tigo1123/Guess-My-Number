import React from 'react';

export function GuessForm({
  guessInput,
  onGuessChange,
  onSubmitGuess,
  disabled,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled) {
      onSubmitGuess(guessInput);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="guess-form-wrapper">
      <div className="input-box">
        <label htmlFor="guess-input" className="sr-only">
          Guess a number
        </label>
        <input
          id="guess-input"
          type="number"
          className="guess"
          placeholder="Type a number..."
          value={guessInput}
          onChange={(e) => onGuessChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
      </div>

      <button type="submit" className="check" disabled={disabled}>
        Check
      </button>
    </form>
  );
}
