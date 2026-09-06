import { useState, useCallback } from 'react';
import { DIFFICULTIES, DEFAULT_DIFFICULTY } from '../constants/difficulty';

function generateSecretNumber(maxNumber) {
  return Math.trunc(Math.random() * maxNumber) + 1;
}

export function useGameState() {
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const config = DIFFICULTIES[difficulty];

  const [secretNumber, setSecretNumber] = useState(() => generateSecretNumber(config.maxNumber));
  const [score, setScore] = useState(config.startingScore);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState('PLAYING'); // 'PLAYING' | 'WON' | 'LOST'
  const [guessInput, setGuessInput] = useState('');
  const [message, setMessage] = useState('Start guessing...');

  // Reset Game (Play Again)
  const resetGame = useCallback((targetDifficulty = difficulty) => {
    const targetConfig = DIFFICULTIES[targetDifficulty] || DIFFICULTIES[DEFAULT_DIFFICULTY];
    setDifficulty(targetDifficulty);
    setSecretNumber(generateSecretNumber(targetConfig.maxNumber));
    setScore(targetConfig.startingScore);
    setStatus('PLAYING');
    setGuessInput('');
    setMessage('Start guessing...');
  }, [difficulty]);

  // Change Difficulty
  const changeDifficulty = useCallback((newLevel) => {
    if (newLevel !== difficulty) {
      resetGame(newLevel);
    }
  }, [difficulty, resetGame]);

  // Make Guess
  const makeGuess = useCallback((rawGuess) => {
    if (status !== 'PLAYING') return;

    const trimmed = String(rawGuess).trim();
    if (!trimmed) {
      setMessage('⛔ No Number');
      return;
    }

    const num = Number(trimmed);

    if (isNaN(num) || !Number.isInteger(num)) {
      setMessage('⛔ Enter a valid integer');
      return;
    }

    if (num < 1 || num > config.maxNumber) {
      setMessage(`⛔ Number must be between 1 and ${config.maxNumber}`);
      return;
    }

    if (num === secretNumber) {
      setStatus('WON');
      setMessage('🎉 Correct Number!');
      setHighScore((prev) => Math.max(prev, score));
      return;
    }

    const newScore = score - 1;
    if (newScore <= 0) {
      setScore(0);
      setStatus('LOST');
      setMessage('💀 Game Over!');
    } else {
      setScore(newScore);
      setMessage(num > secretNumber ? '📉 Too High' : '📈 Too Low');
    }
  }, [config.maxNumber, score, secretNumber, status]);

  return {
    difficulty,
    config,
    secretNumber,
    score,
    highScore,
    status,
    guessInput,
    setGuessInput,
    message,
    changeDifficulty,
    makeGuess,
    resetGame,
  };
}
