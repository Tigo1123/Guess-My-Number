import { useState, useCallback, useEffect } from 'react';
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

function sanitizeNonNegativeInt(val) {
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
    easy: sanitizeNonNegativeInt(raw.easy),
    medium: sanitizeNonNegativeInt(raw.medium),
    hard: sanitizeNonNegativeInt(raw.hard),
  };
}

export const INITIAL_STATISTICS = {
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalValidGuesses: 0,
  byDifficulty: {
    easy: { games: 0, wins: 0, losses: 0 },
    medium: { games: 0, wins: 0, losses: 0 },
    hard: { games: 0, wins: 0, losses: 0 },
  },
};

function sanitizeDifficultyStats(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { games: 0, wins: 0, losses: 0 };
  }
  return {
    games: sanitizeNonNegativeInt(raw.games),
    wins: sanitizeNonNegativeInt(raw.wins),
    losses: sanitizeNonNegativeInt(raw.losses),
  };
}

export function sanitizeStatistics(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return INITIAL_STATISTICS;
  }

  const byDiff = raw.byDifficulty && typeof raw.byDifficulty === 'object' && !Array.isArray(raw.byDifficulty)
    ? raw.byDifficulty
    : {};

  return {
    totalGames: sanitizeNonNegativeInt(raw.totalGames),
    totalWins: sanitizeNonNegativeInt(raw.totalWins),
    totalLosses: sanitizeNonNegativeInt(raw.totalLosses),
    totalValidGuesses: sanitizeNonNegativeInt(raw.totalValidGuesses),
    byDifficulty: {
      easy: sanitizeDifficultyStats(byDiff.easy),
      medium: sanitizeDifficultyStats(byDiff.medium),
      hard: sanitizeDifficultyStats(byDiff.hard),
    },
  };
}

export const INITIAL_STREAK = { currentStreak: 0, bestStreak: 0 };

export function sanitizeStreak(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return INITIAL_STREAK;
  }
  const currentStreak = sanitizeNonNegativeInt(raw.currentStreak);
  const rawBest = sanitizeNonNegativeInt(raw.bestStreak);
  const bestStreak = Math.max(rawBest, currentStreak);
  return { currentStreak, bestStreak };
}

export const INITIAL_BEST_ATTEMPTS = { easy: null, medium: null, hard: null };

function sanitizeAttemptVal(val) {
  if (typeof val === 'number' && Number.isFinite(val) && Number.isInteger(val) && val > 0) {
    return val;
  }
  return null;
}

export function sanitizeBestAttempts(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return INITIAL_BEST_ATTEMPTS;
  }
  return {
    easy: sanitizeAttemptVal(raw.easy),
    medium: sanitizeAttemptVal(raw.medium),
    hard: sanitizeAttemptVal(raw.hard),
  };
}

export function useGameState() {
  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [gameMode, setGameMode] = useState('classic'); // 'classic' | 'timed'

  const config = DIFFICULTIES[difficulty];

  // Persistent high scores per difficulty in localStorage
  const [highScores, setHighScores] = useLocalStorage(
    'guess_my_number_highscores',
    { easy: 0, medium: 0, hard: 0 },
    sanitizeHighScores
  );

  // Persistent lifetime statistics in localStorage
  const [statistics, setStatistics] = useLocalStorage(
    'guess_my_number_statistics',
    INITIAL_STATISTICS,
    sanitizeStatistics
  );

  // Persistent win streak tracking in localStorage
  const [streak, setStreak] = useLocalStorage(
    'guess_my_number_streak',
    INITIAL_STREAK,
    sanitizeStreak
  );

  // Persistent best attempts per difficulty in localStorage
  const [bestAttempts, setBestAttempts] = useLocalStorage(
    'guess_my_number_best_attempts',
    INITIAL_BEST_ATTEMPTS,
    sanitizeBestAttempts
  );

  const [secretNumber, setSecretNumber] = useState(() => generateSecretNumber(config.maxNumber));
  const [score, setScore] = useState(config.startingScore);
  const [status, setStatus] = useState('PLAYING'); // 'PLAYING' | 'WON' | 'LOST'
  const [guessInput, setGuessInput] = useState('');
  const [message, setMessage] = useState('Start guessing...');
  const [attempts, setAttempts] = useState(0);
  const [guessHistory, setGuessHistory] = useState([]);
  const [proximity, setProximity] = useState(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(config.timedDuration);

  // Active difficulty high score
  const currentHighScore = highScores[difficulty] || 0;

  // Reset Game (Play Again, Difficulty Change, or Game Mode Switch)
  const resetGame = useCallback((targetDifficulty = difficulty, targetMode = gameMode) => {
    const targetConfig = DIFFICULTIES[targetDifficulty] || DIFFICULTIES[DEFAULT_DIFFICULTY];
    setDifficulty(targetDifficulty);
    setGameMode(targetMode);
    setSecretNumber(generateSecretNumber(targetConfig.maxNumber));
    setScore(targetConfig.startingScore);
    setStatus('PLAYING');
    setGuessInput('');
    setMessage('Start guessing...');
    setAttempts(0);
    setGuessHistory([]);
    setProximity(null);
    setIsInvalid(false);
    setTimeRemaining(targetConfig.timedDuration);
    setResetToken((prev) => prev + 1);
  }, [difficulty, gameMode]);

  // Change Difficulty
  const changeDifficulty = useCallback((newLevel) => {
    if (newLevel !== difficulty) {
      resetGame(newLevel, gameMode);
    }
  }, [difficulty, gameMode, resetGame]);

  // Change Game Mode
  const changeGameMode = useCallback((newMode) => {
    if (newMode !== gameMode) {
      resetGame(difficulty, newMode);
    }
  }, [difficulty, gameMode, resetGame]);

  // Input change handler clearing invalid state
  const handleGuessChange = useCallback((val) => {
    setGuessInput(val);
    if (isInvalid) {
      setIsInvalid(false);
    }
  }, [isInvalid]);

  // Timer Expiration Callback
  const handleTimerExpired = useCallback(() => {
    if (status !== 'PLAYING') return;

    setStatus('LOST');
    setMessage('⏰ Time Expired! 💀 Game Over!');
    setProximity(null);

    // Reset current streak
    setStreak((prev) => ({
      ...prev,
      currentStreak: 0,
    }));

    // Update statistics exactly once for timed loss
    setStatistics((prev) => {
      const diffStats = prev.byDifficulty[difficulty] || { games: 0, wins: 0, losses: 0 };
      return {
        ...prev,
        totalGames: prev.totalGames + 1,
        totalLosses: prev.totalLosses + 1,
        byDifficulty: {
          ...prev.byDifficulty,
          [difficulty]: {
            ...diffStats,
            games: diffStats.games + 1,
            losses: diffStats.losses + 1,
          },
        },
      };
    });
  }, [difficulty, setStatistics, setStreak, status]);

  // Timed Mode Countdown Effect
  useEffect(() => {
    if (gameMode !== 'timed' || status !== 'PLAYING') {
      return;
    }

    const timerId = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleTimerExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameMode, status, handleTimerExpired]);

  // Reset Statistics, Streaks, and Best Attempts (High Scores unaffected)
  const resetStatistics = useCallback(() => {
    setStatistics(INITIAL_STATISTICS);
    setStreak(INITIAL_STREAK);
    setBestAttempts(INITIAL_BEST_ATTEMPTS);
  }, [setBestAttempts, setStatistics, setStreak]);

  // Make Guess
  const makeGuess = useCallback((rawGuess) => {
    if (status !== 'PLAYING') return;

    const trimmed = String(rawGuess).trim();
    if (!trimmed) {
      setMessage('⛔ No Number');
      setIsInvalid(true);
      return;
    }

    const num = Number(trimmed);

    if (isNaN(num) || !Number.isInteger(num)) {
      setMessage('⛔ Enter a valid integer');
      setIsInvalid(true);
      return;
    }

    if (num < 1 || num > config.maxNumber) {
      setMessage(`⛔ Number must be between 1 and ${config.maxNumber}`);
      setIsInvalid(true);
      return;
    }

    // Valid guess: clear invalid flag and increment attempts
    setIsInvalid(false);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // WIN CONDITION
    if (num === secretNumber) {
      setStatus('WON');
      setMessage('🎉 Correct Number!');
      setProximity(null);
      setGuessHistory((prev) => [...prev, { guess: num, result: 'Correct' }]);

      // Update high score for active difficulty
      setHighScores((prev) => ({
        ...prev,
        [difficulty]: Math.max(prev[difficulty] || 0, score),
      }));

      // Update win streak
      setStreak((prev) => {
        const nextCurrent = prev.currentStreak + 1;
        const nextBest = Math.max(prev.bestStreak, nextCurrent);
        return { currentStreak: nextCurrent, bestStreak: nextBest };
      });

      // Update best attempts for active difficulty
      setBestAttempts((prev) => {
        const currentBest = prev[difficulty];
        const nextBest = currentBest === null ? newAttempts : Math.min(currentBest, newAttempts);
        return { ...prev, [difficulty]: nextBest };
      });

      // Update statistics exactly once for winning game end
      setStatistics((prev) => {
        const diffStats = prev.byDifficulty[difficulty] || { games: 0, wins: 0, losses: 0 };
        return {
          ...prev,
          totalGames: prev.totalGames + 1,
          totalWins: prev.totalWins + 1,
          totalValidGuesses: prev.totalValidGuesses + 1,
          byDifficulty: {
            ...prev.byDifficulty,
            [difficulty]: {
              ...diffStats,
              games: diffStats.games + 1,
              wins: diffStats.wins + 1,
            },
          },
        };
      });
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

      // Reset streak on loss
      setStreak((prev) => ({ ...prev, currentStreak: 0 }));

      // Update statistics exactly once for losing game end
      setStatistics((prev) => {
        const diffStats = prev.byDifficulty[difficulty] || { games: 0, wins: 0, losses: 0 };
        return {
          ...prev,
          totalGames: prev.totalGames + 1,
          totalLosses: prev.totalLosses + 1,
          totalValidGuesses: prev.totalValidGuesses + 1,
          byDifficulty: {
            ...prev.byDifficulty,
            [difficulty]: {
              ...diffStats,
              games: diffStats.games + 1,
              losses: diffStats.losses + 1,
            },
          },
        };
      });
    } else {
      setScore(newScore);
      setMessage(num > secretNumber ? '📉 Too High' : '📈 Too Low');

      // Update lifetime valid guesses for in-progress game valid guess
      setStatistics((prev) => ({
        ...prev,
        totalValidGuesses: prev.totalValidGuesses + 1,
      }));
    }
  }, [attempts, config.maxNumber, difficulty, score, secretNumber, setBestAttempts, setHighScores, setStatistics, setStreak, status]);

  return {
    difficulty,
    gameMode,
    config,
    secretNumber,
    score,
    highScore: currentHighScore,
    status,
    guessInput,
    setGuessInput: handleGuessChange,
    message,
    attempts,
    guessHistory,
    proximity,
    isInvalid,
    resetToken,
    statistics,
    streak,
    bestAttempts,
    timeRemaining,
    changeDifficulty,
    changeGameMode,
    makeGuess,
    resetGame,
    resetStatistics,
  };
}
