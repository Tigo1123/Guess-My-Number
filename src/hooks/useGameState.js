import { useState, useCallback } from 'react';
import { DIFFICULTIES, DEFAULT_DIFFICULTY } from '../constants/difficulty';
import { useLocalStorage } from './useLocalStorage';

function generateSecretNumber(maxNumber) {
  return Math.trunc(Math.random() * maxNumber) + 1;
}

function calculateProximity(distance) {
  if (distance <= 2) return 'Burning Hot';
  if (distance <= 5) return 'Hot';
  if (distance <= 10) return 'Warm';
  return 'Cold';
}

function sanitizeHighScoreValue(val) {
  if (typeof val === 'number' && Number.isFinite(val) && Number.isInteger(val) && val >= 0) {
    return val;
  }
  return 0;
}

export function sanitizeHighScores(raw) {
  const fallback = { easy: 0, medium: 0, hard: 0 };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback;
  }
  return {
    easy: sanitizeHighScoreValue(raw.easy),
    medium: sanitizeHighScoreValue(raw.medium),
    hard: sanitizeHighScoreValue(raw.hard),
  };
}

export function useGameState() {
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const config = DIFFICULTIES[difficulty];

  // Persistent high scores per difficulty in localStorage with normalization
  const [highScores, setHighScores] = useLocalStorage(
    'guess_my_number_highscores',
    { easy: 0, medium: 0, hard: 0 },
    sanitizeHighScores
  );

  const [secretNumber, setSecretNumber] = useState(() => generateSecretNumber(config.maxNumber));
  const [score, setScore] = useState(config.startingScore);
  const [status, setStatus] = useState('PLAYING'); // 'PLAYING' | 'WON' | 'LOST'
  const [guessInput, setGuessInput] = useState('');
  const [message, setMessage] = useState('Start guessing...');
  const [attempts, setAttempts] = useState(0);
  const [guessHistory, setGuessHistory] = useState([]);
  const [proximity, setProximity] = useState(null);

  // Active difficulty high score
  const currentHighScore = highScores[difficulty] || 0;

  // Reset Game (Play Again or Difficulty Change)
  const resetGame = useCallback((targetDifficulty = difficulty) => {
    const targetConfig = DIFFICULTIES[targetDifficulty] || DIFFICULTIES[DEFAULT_DIFFICULTY];
    setDifficulty(targetDifficulty);
    setSecretNumber(generateSecretNumber(targetConfig.maxNumber));
    setScore(targetConfig.startingScore);
    setStatus('PLAYING');
    setGuessInput('');
    setMessage('Start guessing...');
    setAttempts(0);
    setGuessHistory([]);
    setProximity(null);
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

    // Valid in-range integer guess verified
    setAttempts((prev) => prev + 1);

    if (num === secretNumber) {
      setStatus('WON');
      setMessage('🎉 Correct Number!');
      setProximity(null);
      setGuessHistory((prev) => [...prev, { guess: num, result: 'Correct' }]);

      // Update persistent high score for active difficulty only
      setHighScores((prev) => ({
        ...prev,
        [difficulty]: Math.max(prev[difficulty] || 0, score),
      }));
      return;
    }

    const distance = Math.abs(num - secretNumber);
    const prox = calculateProximity(distance);
    setProximity(prox);

    const resultLabel = num > secretNumber ? 'Too High' : 'Too Low';
    setGuessHistory((prev) => [...prev, { guess: num, result: resultLabel }]);

    const newScore = score - 1;
    if (newScore <= 0) {
      setScore(0);
      setStatus('LOST');
      setMessage('💀 Game Over!');
      setProximity(null);
    } else {
      setScore(newScore);
      setMessage(num > secretNumber ? '📉 Too High' : '📈 Too Low');
    }
  }, [config.maxNumber, difficulty, score, secretNumber, setHighScores, status]);

  return {
    difficulty,
    config,
    secretNumber,
    score,
    highScore: currentHighScore,
    status,
    guessInput,
    setGuessInput,
    message,
    attempts,
    guessHistory,
    proximity,
    changeDifficulty,
    makeGuess,
    resetGame,
  };
}
