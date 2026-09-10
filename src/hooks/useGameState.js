import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { DIFFICULTIES, DEFAULT_DIFFICULTY } from '../constants/difficulty';
import { ACHIEVEMENTS, ACHIEVEMENT_IDS } from '../constants/achievements';
import {
  getLocalDateKey,
  createDailyChallenge,
  getYesterdayDateKey,
} from '../utils/dailyChallenge';
import { useLocalStorage } from './useLocalStorage';
import { usePlayerProfiles } from './usePlayerProfiles';
import { sanitizeGameHistory, generateUUID } from '../utils/profileStorage';
import { deriveChallengeNumber } from '../utils/challenge';
import { getProximityLevel } from '../utils/proximity';

function generateSecretNumber(maxNumber) {
  return Math.trunc(Math.random() * maxNumber) + 1;
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

export function sanitizeBestEndlessStreak(raw) {
  return typeof raw === 'number' && Number.isFinite(raw) && Number.isInteger(raw) && raw >= 0 ? raw : 0;
}

export function sanitizeAchievements(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const validSet = new Set(ACHIEVEMENT_IDS);
  return Array.from(new Set(raw.filter((id) => typeof id === 'string' && validSet.has(id))));
}

export const INITIAL_DAILY_STREAK = { current: 0, best: 0, lastCompletedDate: null };

export function sanitizeDailyStreak(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return INITIAL_DAILY_STREAK;
  }
  const current = sanitizeNonNegativeInt(raw.current);
  const rawBest = sanitizeNonNegativeInt(raw.best);
  const best = Math.max(rawBest, current);

  const isValidDate = typeof raw.lastCompletedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastCompletedDate);
  const lastCompletedDate = isValidDate ? raw.lastCompletedDate : null;

  return { current, best, lastCompletedDate };
}

export function sanitizeDailyChallengeHistory(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const result = {};
  const dateKeys = Object.keys(raw).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k));
  // Sort date keys descending and keep latest 30
  dateKeys.sort().reverse();
  const keepKeys = dateKeys.slice(0, 30);

  for (const k of keepKeys) {
    const entry = raw[k];
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      result[k] = {
        completed: Boolean(entry.completed),
        won: Boolean(entry.won),
        attempts: sanitizeNonNegativeInt(entry.attempts),
        score: sanitizeNonNegativeInt(entry.score),
        mode: typeof entry.mode === 'string' ? entry.mode : 'classic',
        difficulty: typeof entry.difficulty === 'string' ? entry.difficulty : 'easy',
      };
    }
  }

  return result;
}

export function useGameState() {
  const playerProfiles = usePlayerProfiles();
  const {
    profilesData,
    profiles,
    activeProfileId,
    activeProfile,
    createProfile,
    switchProfile,
    renameProfile,
    deleteProfile,
    updateActiveProgress,
    triggerExport,
    restoreBackup,
  } = playerProfiles;

  const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
  const [gameMode, setGameMode] = useState('classic'); // 'classic' | 'timed' | 'limited' | 'endless'
  const [endlessRun, setEndlessRun] = useState({ active: false, runId: null, roundsWon: 0, currentRound: 1, totalGuesses: 0, newBest: false });

  const config = DIFFICULTIES[difficulty];

  // Daily Challenge state
  const todayKey = useMemo(() => getLocalDateKey(), []);
  const dailyChallengeConfig = useMemo(() => createDailyChallenge(todayKey), [todayKey]);

  const [isDailyChallengeActive, setIsDailyChallengeActive] = useState(false);
  const [isPracticeReplay, setIsPracticeReplay] = useState(false);
  const [isFriendChallengeActive, setIsFriendChallengeActive] = useState(false);
  const [friendChallengeSeed, setFriendChallengeSeed] = useState(null);

  // Profile-scoped persistent progress getters
  const activeProgress = activeProfile ? activeProfile.progress : {};

  const highScores = useMemo(() => sanitizeHighScores(activeProgress.highScores), [activeProgress.highScores]);
  const statistics = useMemo(() => sanitizeStatistics(activeProgress.statistics), [activeProgress.statistics]);
  const streak = useMemo(() => sanitizeStreak(activeProgress.streak), [activeProgress.streak]);
  const bestAttempts = useMemo(() => sanitizeBestAttempts(activeProgress.bestAttempts), [activeProgress.bestAttempts]);
  const bestEndlessStreak = useMemo(() => sanitizeBestEndlessStreak(activeProgress.bestEndlessStreak), [activeProgress.bestEndlessStreak]);
  const achievements = useMemo(() => sanitizeAchievements(activeProgress.achievements), [activeProgress.achievements]);
  const dailyChallengeHistory = useMemo(() => sanitizeDailyChallengeHistory(activeProgress.dailyChallengeHistory), [activeProgress.dailyChallengeHistory]);
  const dailyStreak = useMemo(() => sanitizeDailyStreak(activeProgress.dailyStreak), [activeProgress.dailyStreak]);
  const gameHistory = useMemo(() => sanitizeGameHistory(activeProgress.gameHistory), [activeProgress.gameHistory]);

  // Profile-scoped progress setters
  const setHighScores = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      highScores: typeof updater === 'function' ? updater(prev.highScores) : updater,
    }));
  }, [updateActiveProgress]);

  const setStatistics = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      statistics: typeof updater === 'function' ? updater(prev.statistics) : updater,
    }));
  }, [updateActiveProgress]);

  const setStreak = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      streak: typeof updater === 'function' ? updater(prev.streak) : updater,
    }));
  }, [updateActiveProgress]);

  const setBestAttempts = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      bestAttempts: typeof updater === 'function' ? updater(prev.bestAttempts) : updater,
    }));
  }, [updateActiveProgress]);

  const setBestEndlessStreak = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      bestEndlessStreak: typeof updater === 'function' ? updater(sanitizeBestEndlessStreak(prev.bestEndlessStreak)) : updater,
    }));
  }, [updateActiveProgress]);

  const setAchievements = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      achievements: typeof updater === 'function' ? updater(prev.achievements) : updater,
    }));
  }, [updateActiveProgress]);

  const setDailyChallengeHistory = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      dailyChallengeHistory: typeof updater === 'function' ? updater(prev.dailyChallengeHistory) : updater,
    }));
  }, [updateActiveProgress]);

  const setDailyStreak = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      dailyStreak: typeof updater === 'function' ? updater(prev.dailyStreak) : updater,
    }));
  }, [updateActiveProgress]);

  const setGameHistory = useCallback((updater) => {
    updateActiveProgress((prev) => ({
      ...prev,
      gameHistory: sanitizeGameHistory(typeof updater === 'function' ? updater(prev.gameHistory) : updater),
    }));
  }, [updateActiveProgress]);

  const clearGameHistory = useCallback(() => {
    setGameHistory([]);
  }, [setGameHistory]);

  // Sync legacy localStorage keys for backward compatibility
  useEffect(() => {
    try {
      localStorage.setItem('guess_my_number_highscores', JSON.stringify(highScores));
      localStorage.setItem('guess_my_number_statistics', JSON.stringify(statistics));
      localStorage.setItem('guess_my_number_streak', JSON.stringify(streak));
      localStorage.setItem('guess_my_number_best_attempts', JSON.stringify(bestAttempts));
      localStorage.setItem('guess_my_number_achievements', JSON.stringify(achievements));
      localStorage.setItem('guess_my_number_daily_challenge', JSON.stringify(dailyChallengeHistory));
      localStorage.setItem('guess_my_number_daily_streak', JSON.stringify(dailyStreak));
    } catch {
      // Ignore storage sync errors
    }
  }, [highScores, statistics, streak, bestAttempts, achievements, dailyChallengeHistory, dailyStreak]);

  const todayResult = dailyChallengeHistory[todayKey] || null;
  const isCompletedToday = Boolean(todayResult && todayResult.completed);

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

  // Phase 8 Hints & Achievements state
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [lastHintCategory, setLastHintCategory] = useState(null);
  const [unlockedThisRound, setUnlockedThisRound] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Hint Cost per difficulty
  const hintCost = difficulty === 'hard' ? 1 : 2;
  const canAffordHint = score - hintCost >= 1 && !(gameMode === 'endless' && hintsUsed >= 1);

  // Active difficulty high score
  const currentHighScore = highScores[difficulty] || 0;

  const isRoundFinishedRef = useRef(false);

  // Reset Game (Play Again, Difficulty Change, Game Mode Switch, Daily Challenge Start)
  const resetGame = useCallback((
    targetDifficulty = difficulty,
    targetMode = gameMode,
    forcedSecretNumber = null
  ) => {
    isRoundFinishedRef.current = false;
    const targetConfig = DIFFICULTIES[targetDifficulty] || DIFFICULTIES[DEFAULT_DIFFICULTY];
    setDifficulty(targetDifficulty);
    setGameMode(targetMode);
    const challengeNumber = isFriendChallengeActive && friendChallengeSeed
      ? deriveChallengeNumber(friendChallengeSeed, targetDifficulty)
      : null;
    setSecretNumber(forcedSecretNumber ?? challengeNumber ?? generateSecretNumber(targetConfig.maxNumber));
    setScore(targetConfig.startingScore);
    setStatus('PLAYING');
    setGuessInput('');
    setMessage('Start guessing...');
    setAttempts(0);
    setGuessHistory([]);
    setProximity(null);
    setIsInvalid(false);
    setTimeRemaining(targetConfig.timedDuration);
    setHintsUsed(0);
    setCurrentHint(null);
    setLastHintCategory(null);
    setUnlockedThisRound([]);
    setToastMessage(null);
    setResetToken((prev) => prev + 1);
  }, [difficulty, friendChallengeSeed, gameMode, isFriendChallengeActive]);

  const createEndlessRun = useCallback(() => ({ active: true, runId: generateUUID(), roundsWon: 0, currentRound: 1, totalGuesses: 0, newBest: false }), []);

  // Profile switch reset effect
  const prevProfileIdRef = useRef(activeProfileId);
  useEffect(() => {
    if (prevProfileIdRef.current !== activeProfileId) {
      prevProfileIdRef.current = activeProfileId;
      setIsDailyChallengeActive(false);
      setIsPracticeReplay(false);
      setIsFriendChallengeActive(false);
      setFriendChallengeSeed(null);
      setEndlessRun({ active: false, runId: null, roundsWon: 0, currentRound: 1, totalGuesses: 0, newBest: false });
      resetGame(DEFAULT_DIFFICULTY, 'classic');
    }
  }, [activeProfileId, resetGame]);

  // Change Difficulty
  const changeDifficulty = useCallback((newLevel) => {
    if (newLevel !== difficulty && !isDailyChallengeActive && !isFriendChallengeActive) {
      resetGame(newLevel, gameMode);
    }
  }, [difficulty, gameMode, isDailyChallengeActive, isFriendChallengeActive, resetGame]);

  // Change Game Mode
  const changeGameMode = useCallback((newMode) => {
    if (newMode !== gameMode && !isDailyChallengeActive && !isFriendChallengeActive) {
      if (newMode === 'endless') setEndlessRun(createEndlessRun());
      else setEndlessRun({ active: false, runId: null, roundsWon: 0, currentRound: 1, totalGuesses: 0, newBest: false });
      resetGame(difficulty, newMode);
    }
  }, [createEndlessRun, difficulty, gameMode, isDailyChallengeActive, isFriendChallengeActive, resetGame]);

  const restartGame = useCallback(() => {
    if (gameMode === 'endless') {
      setEndlessRun(createEndlessRun());
      resetGame(difficulty, 'endless');
    } else resetGame();
  }, [createEndlessRun, difficulty, gameMode, resetGame]);

  const advanceEndlessRound = useCallback(() => {
    if (gameMode !== 'endless' || !endlessRun.active || status !== 'WON') return;
    setEndlessRun((prev) => ({ ...prev, currentRound: prev.currentRound + 1 }));
    resetGame(difficulty, 'endless');
  }, [difficulty, endlessRun.active, gameMode, resetGame, status]);

  // Start Daily Challenge (Official or Practice Replay)
  const startDailyChallenge = useCallback(() => {
    const isReplay = isCompletedToday;
    setIsDailyChallengeActive(true);
    setIsPracticeReplay(isReplay);
    resetGame(dailyChallengeConfig.difficulty, dailyChallengeConfig.mode, dailyChallengeConfig.secretNumber);
  }, [dailyChallengeConfig, isCompletedToday, resetGame]);

  const startPracticeReplay = useCallback(() => {
    setIsDailyChallengeActive(true);
    setIsPracticeReplay(true);
    resetGame(dailyChallengeConfig.difficulty, dailyChallengeConfig.mode, dailyChallengeConfig.secretNumber);
  }, [dailyChallengeConfig, resetGame]);

  const exitDailyChallenge = useCallback(() => {
    setIsDailyChallengeActive(false);
    setIsPracticeReplay(false);
    resetGame(DEFAULT_DIFFICULTY, 'classic');
  }, [resetGame]);

  const startFriendChallenge = useCallback((targetDifficulty, seed) => {
    const challengeNumber = deriveChallengeNumber(seed, targetDifficulty);
    if (!challengeNumber) return false;
    setIsDailyChallengeActive(false);
    setIsPracticeReplay(false);
    setIsFriendChallengeActive(true);
    setFriendChallengeSeed(seed);
    resetGame(targetDifficulty, 'classic', challengeNumber);
    return true;
  }, [resetGame]);

  const exitFriendChallenge = useCallback(() => {
    setIsFriendChallengeActive(false);
    setFriendChallengeSeed(null);
    resetGame(DEFAULT_DIFFICULTY, 'classic', generateSecretNumber(DIFFICULTIES[DEFAULT_DIFFICULTY].maxNumber));
  }, [resetGame]);

  // Input change handler clearing invalid state
  const handleGuessChange = useCallback((val) => {
    setGuessInput(val);
    if (isInvalid) {
      setIsInvalid(false);
    }
  }, [isInvalid]);

  // Check and unlock achievements helper
  const evaluateAchievements = useCallback((context) => {
    const {
      isWin,
      finalAttempts,
      newCurrentStreak,
      totalGamesCount,
      totalWinsCount,
      difficultyLevel,
      mode,
      remainingTime,
      hintsCount,
      isOfficialDaily,
      nextDailyStreakCount,
      isFriendChallenge,
      completedHistory = [],
      endlessRoundsWon = 0,
    } = context;

    const currentUnlocked = new Set(achievements);
    const newUnlocks = [];
    const newUnlockIds = [];

    const tryUnlock = (id) => {
      if (!currentUnlocked.has(id)) {
        currentUnlocked.add(id);
        newUnlockIds.push(id);
        const achDef = ACHIEVEMENTS.find((a) => a.id === id);
        if (achDef) {
          newUnlocks.push(achDef.title);
        }
      }
    };

      if (isFriendChallenge) tryUnlock('CHALLENGER');
      if (mode === 'endless' && endlessRoundsWon >= 3) tryUnlock('ENDLESS_STARTER');
      if (mode === 'endless' && endlessRoundsWon >= 5) tryUnlock('ENDLESS_UNSTOPPABLE');
      if (mode === 'endless' && endlessRoundsWon >= 10) tryUnlock('ENDLESS_MASTER');

    if (isWin) {
      if (totalWinsCount >= 1) tryUnlock('FIRST_WIN');
      if (newCurrentStreak >= 3) tryUnlock('ON_FIRE');
      if (finalAttempts === 1) tryUnlock('PERFECT_GUESS');
      if (finalAttempts <= 3) tryUnlock('SHARPSHOOTER');
      if (mode === 'timed' && remainingTime >= DIFFICULTIES[difficultyLevel].timedDuration / 2) {
        tryUnlock('SPEED_DEMON');
      }
      if (difficultyLevel === 'hard') tryUnlock('HARD_MODE_HERO');
      if (hintsCount === 0) tryUnlock('NO_HELP_NEEDED');
      if (isOfficialDaily) tryUnlock('DAILY_WINNER');
      if (totalGamesCount >= 25) tryUnlock('VETERAN_25');
      const completed = [...completedHistory, { result: 'WIN', difficulty: difficultyLevel, mode, isDailyChallenge: isOfficialDaily, isFriendChallenge }];
      if (new Set(completed.filter((game) => game.result === 'WIN').map((game) => game.difficulty)).size >= 3) tryUnlock('DIFFICULTY_MASTER');
      const modeSet = new Set(completed.filter((game) => game.result === 'WIN').map((game) => game.isFriendChallenge ? 'friend' : game.isDailyChallenge ? 'daily' : game.mode));
      if (['classic', 'timed', 'limited', 'daily', 'friend'].every((key) => modeSet.has(key))) tryUnlock('MODE_MASTER');
    }

    if (isOfficialDaily) {
      tryUnlock('DAILY_DEBUT');
      if (nextDailyStreakCount >= 3) tryUnlock('DAILY_STREAK_3');
    }

    if (totalGamesCount >= 10) tryUnlock('VETERAN');

    if (newUnlocks.length > 0) {
      setAchievements(Array.from(currentUnlocked));
      setUnlockedThisRound((prev) => [...prev, ...newUnlocks]);
      setToastMessage(newUnlocks);
    }

    return newUnlockIds;
  }, [achievements, setAchievements]);

  // Add History Entry Helper
  const addHistoryEntry = useCallback((entryData) => {
    const nextEntry = {
      id: generateUUID(),
      playedAt: new Date().toISOString(),
      result: entryData.result,
      difficulty: entryData.difficulty || difficulty,
      mode: entryData.mode || gameMode,
      score: entryData.score ?? score,
      attempts: entryData.attempts ?? attempts,
      hintsUsed: entryData.hintsUsed ?? hintsUsed,
      secretNumber: entryData.secretNumber ?? secretNumber,
      validGuesses: entryData.validGuesses || [],
      timeRemaining: entryData.timeRemaining ?? (gameMode === 'timed' ? Math.max(0, timeRemaining) : null),
      maxTime: entryData.maxTime ?? (gameMode === 'timed' ? DIFFICULTIES[difficulty].timedDuration : null),
      maxAttempts: entryData.maxAttempts ?? (gameMode === 'limited' ? DIFFICULTIES[difficulty].maxAttempts : null),
      attemptsRemaining: entryData.attemptsRemaining ?? (gameMode === 'limited' ? Math.max(0, DIFFICULTIES[difficulty].maxAttempts - (entryData.attempts ?? attempts)) : null),
      isDailyChallenge: Boolean(isDailyChallengeActive),
      isFriendChallenge: Boolean(entryData.isFriendChallenge ?? isFriendChallengeActive),
      endlessRunId: entryData.endlessRunId ?? null,
      endlessRound: entryData.endlessRound ?? 0,
      endlessStreak: entryData.endlessStreak ?? 0,
      dailyChallengeType: isDailyChallengeActive ? (isPracticeReplay ? 'practice' : 'official') : null,
      dailyDateKey: isDailyChallengeActive ? todayKey : null,
      achievementsUnlocked: entryData.achievementsUnlocked || [],
    };

    setGameHistory((prev) => sanitizeGameHistory([...(prev || []), nextEntry]));
  }, [attempts, difficulty, gameMode, hintsUsed, isDailyChallengeActive, isFriendChallengeActive, isPracticeReplay, score, secretNumber, setGameHistory, timeRemaining, todayKey]);

  // Process Official Daily Completion Result
  const handleOfficialDailyCompletion = useCallback((isWin, finalAttempts, finalScore) => {
    if (!isDailyChallengeActive || isPracticeReplay) return;

    // Record official daily completion result
    setDailyChallengeHistory((prev) => ({
      ...prev,
      [todayKey]: {
        completed: true,
        won: isWin,
        attempts: finalAttempts,
        score: finalScore,
        mode: gameMode,
        difficulty,
      },
    }));

    // Update Daily Streak
    let nextDailyStreakCount = 0;
    setDailyStreak((prev) => {
      if (prev.lastCompletedDate === todayKey) return prev;
      const yesterdayKey = getYesterdayDateKey(todayKey);
      const isConsecutive = prev.lastCompletedDate === yesterdayKey;
      const nextCurrent = isConsecutive ? prev.current + 1 : 1;
      const nextBest = Math.max(prev.best, nextCurrent);
      nextDailyStreakCount = nextCurrent;
      return { current: nextCurrent, best: nextBest, lastCompletedDate: todayKey };
    });

    return nextDailyStreakCount;
  }, [difficulty, gameMode, isDailyChallengeActive, isPracticeReplay, setDailyChallengeHistory, setDailyStreak, todayKey]);

  // Timer Expiration Callback
  const handleTimerExpired = useCallback(() => {
    if (status !== 'PLAYING' || isRoundFinishedRef.current) return;
    isRoundFinishedRef.current = true;

    setStatus('LOST');
    setMessage('⏰ Time Expired! 💀 Game Over!');
    setProximity(null);

    // Reset current streak
    setStreak((prev) => ({
      ...prev,
      currentStreak: 0,
    }));

    const isOfficialDaily = isDailyChallengeActive && !isPracticeReplay;
    const nextDailyStreakCount = handleOfficialDailyCompletion(false, attempts, 0);

    // Update statistics exactly once for timed loss
    setStatistics((prev) => {
      const diffStats = prev.byDifficulty[difficulty] || { games: 0, wins: 0, losses: 0 };
      const nextTotalGames = prev.totalGames + 1;
      const nextTotalWins = prev.totalWins;

      const unlockedIds = evaluateAchievements({
        isWin: false,
        finalAttempts: attempts,
        newCurrentStreak: 0,
        totalGamesCount: nextTotalGames,
        totalWinsCount: nextTotalWins,
        difficultyLevel: difficulty,
        mode: gameMode,
        remainingTime: 0,
        hintsCount: hintsUsed,
        isOfficialDaily,
        isFriendChallenge: isFriendChallengeActive,
        completedHistory: gameHistory,
        nextDailyStreakCount: nextDailyStreakCount || 0,
      });

      addHistoryEntry({
        result: 'LOSS',
        score: 0,
        attempts: attempts,
        hintsUsed: hintsUsed,
        secretNumber,
        validGuesses: guessHistory.map((g) => g.guess),
        timeRemaining: 0,
        achievementsUnlocked: unlockedIds || [],
      });

      return {
        ...prev,
        totalGames: nextTotalGames,
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
  }, [attempts, difficulty, evaluateAchievements, gameMode, gameHistory, handleOfficialDailyCompletion, hintsUsed, isDailyChallengeActive, isFriendChallengeActive, isPracticeReplay, setStatistics, setStreak, status]);

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

  // Reset Statistics, Streaks, and Best Attempts (High Scores & Achievements unaffected)
  const resetStatistics = useCallback(() => {
    setStatistics(INITIAL_STATISTICS);
    setStreak(INITIAL_STREAK);
    setBestAttempts(INITIAL_BEST_ATTEMPTS);
  }, [setBestAttempts, setStatistics, setStreak]);

  // Get Hint Callback
  const getHint = useCallback(() => {
    if (status !== 'PLAYING') return;
    if (gameMode === 'endless' && hintsUsed >= 1) return;
    if (score - hintCost < 1) return;

    setScore((prev) => prev - hintCost);
    setHintsUsed((prev) => prev + 1);

    const isEven = secretNumber % 2 === 0;
    const parityText = `The secret number is ${isEven ? 'EVEN' : 'ODD'}.`;

    const rangeStep = 10;
    const rangeStart = Math.max(1, Math.floor((secretNumber - 1) / rangeStep) * rangeStep + 1);
    const rangeEnd = Math.min(config.maxNumber, rangeStart + rangeStep - 1);
    const rangeText = `The number is between ${rangeStart} and ${rangeEnd}.`;

    let divText = null;
    if (secretNumber % 5 === 0) {
      divText = 'The number is divisible by 5.';
    } else if (secretNumber % 3 === 0) {
      divText = 'The number is divisible by 3.';
    }

    let nextCategory = 'parity';
    if (lastHintCategory === 'parity') {
      nextCategory = 'range';
    } else if (lastHintCategory === 'range') {
      nextCategory = divText ? 'divisibility' : 'parity';
    } else {
      nextCategory = 'parity';
    }

    let hintText = parityText;
    if (nextCategory === 'range') {
      hintText = rangeText;
    } else if (nextCategory === 'divisibility' && divText) {
      hintText = divText;
    }

    if (hintText === currentHint) {
      hintText = parityText !== currentHint ? parityText : rangeText;
    }

    setLastHintCategory(nextCategory);
    setCurrentHint(hintText);
  }, [config.maxNumber, currentHint, gameMode, hintCost, hintsUsed, lastHintCategory, score, secretNumber, status]);

  // Make Guess
  const makeGuess = useCallback((rawGuess) => {
    if (status !== 'PLAYING' || isRoundFinishedRef.current) return;

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

    const isOfficialDaily = isDailyChallengeActive && !isPracticeReplay;

    // WIN CONDITION
    if (num === secretNumber) {
      isRoundFinishedRef.current = true;
      setStatus('WON');
      setMessage('🎉 Correct Number!');
      setProximity(null);
      setGuessHistory((prev) => [...prev, { guess: num, result: 'Correct' }]);

      // Update high score for active difficulty
      setHighScores((prev) => ({
        ...prev,
        [difficulty]: Math.max(prev[difficulty] || 0, score),
      }));

      // Calculate new streak
      let nextCurrentStreak = 0;
      let nextBestStreak = 0;
      setStreak((prev) => {
        nextCurrentStreak = prev.currentStreak + 1;
        nextBestStreak = Math.max(prev.bestStreak, nextCurrentStreak);
        return { currentStreak: nextCurrentStreak, bestStreak: nextBestStreak };
      });

      // Update best attempts for active difficulty
      setBestAttempts((prev) => {
        const currentBest = prev[difficulty];
        const nextBest = currentBest === null ? newAttempts : Math.min(currentBest, newAttempts);
        return { ...prev, [difficulty]: nextBest };
      });

      const nextDailyStreakCount = handleOfficialDailyCompletion(true, newAttempts, score);
      const nextEndlessRoundsWon = gameMode === 'endless' && endlessRun.active ? endlessRun.roundsWon + 1 : 0;

      // Update statistics & check achievements exactly once for winning game end
      setStatistics((prev) => {
        const diffStats = prev.byDifficulty[difficulty] || { games: 0, wins: 0, losses: 0 };
        const nextTotalGames = prev.totalGames + 1;
        const nextTotalWins = prev.totalWins + 1;

        const unlockedIds = evaluateAchievements({
          isWin: true,
          finalAttempts: newAttempts,
          newCurrentStreak: nextCurrentStreak,
          totalGamesCount: nextTotalGames,
          totalWinsCount: nextTotalWins,
          difficultyLevel: difficulty,
          mode: gameMode,
          remainingTime: timeRemaining,
          hintsCount: hintsUsed,
          isOfficialDaily,
          isFriendChallenge: isFriendChallengeActive,
          completedHistory: gameHistory,
          endlessRoundsWon: nextEndlessRoundsWon,
          nextDailyStreakCount: nextDailyStreakCount || 0,
        });

        const winGuesses = [...guessHistory, { guess: num, result: 'Correct' }].map((g) => g.guess);
        addHistoryEntry({
          result: 'WIN',
          score: score,
          attempts: newAttempts,
          hintsUsed: hintsUsed,
          secretNumber,
          validGuesses: winGuesses,
          timeRemaining: gameMode === 'timed' ? Math.max(0, timeRemaining) : null,
          attemptsRemaining: gameMode === 'limited' ? Math.max(0, config.maxAttempts - newAttempts) : gameMode === 'endless' ? Math.max(0, (difficulty === 'easy' ? 6 : difficulty === 'medium' ? 7 : 8) - newAttempts) : null,
          maxAttempts: gameMode === 'endless' ? (difficulty === 'easy' ? 6 : difficulty === 'medium' ? 7 : 8) : null,
          endlessRunId: gameMode === 'endless' ? endlessRun.runId : null,
          endlessRound: gameMode === 'endless' ? endlessRun.currentRound : 0,
          endlessStreak: nextEndlessRoundsWon,
          achievementsUnlocked: unlockedIds || [],
        });

        return {
          ...prev,
          totalGames: nextTotalGames,
          totalWins: nextTotalWins,
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
      if (gameMode === 'endless' && endlessRun.active) {
        setEndlessRun((prev) => ({ ...prev, roundsWon: nextEndlessRoundsWon, totalGuesses: prev.totalGuesses + newAttempts, newBest: prev.newBest || nextEndlessRoundsWon > bestEndlessStreak }));
        setBestEndlessStreak((prev) => Math.max(prev, nextEndlessRoundsWon));
      }
      return;
    }

    const prox = getProximityLevel(num, secretNumber, config.maxNumber);
    setProximity(prox);

    const resultLabel = num > secretNumber ? 'Too High' : 'Too Low';
    setGuessHistory((prev) => [...prev, { guess: num, result: resultLabel }]);

    const newScore = score - 1;
    const endlessMaxAttempts = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 7 : 8;
    const isLimitedAttemptsExhausted = (gameMode === 'limited' && newAttempts >= config.maxAttempts) || (gameMode === 'endless' && newAttempts >= endlessMaxAttempts);
    const isLoss = newScore <= 0 || isLimitedAttemptsExhausted;

    if (isLoss) {
      isRoundFinishedRef.current = true;
      const lossScore = newScore <= 0 ? 0 : newScore;
      setScore(lossScore);
      setStatus('LOST');
      setMessage(
        isLimitedAttemptsExhausted
          ? '❌ Attempts Exhausted! 💀 Game Over!'
          : '💀 Game Over!'
      );
      setProximity(null);

      // Reset streak on loss
      setStreak((prev) => ({ ...prev, currentStreak: 0 }));

      const nextDailyStreakCount = handleOfficialDailyCompletion(false, newAttempts, lossScore);

      // Update statistics & check achievements exactly once for losing game end
      setStatistics((prev) => {
        const diffStats = prev.byDifficulty[difficulty] || { games: 0, wins: 0, losses: 0 };
        const nextTotalGames = prev.totalGames + 1;
        const nextTotalWins = prev.totalWins;

        const unlockedIds = evaluateAchievements({
          isWin: false,
          finalAttempts: newAttempts,
          newCurrentStreak: 0,
          totalGamesCount: nextTotalGames,
          totalWinsCount: nextTotalWins,
          difficultyLevel: difficulty,
          mode: gameMode,
          remainingTime: timeRemaining,
          hintsCount: hintsUsed,
          isOfficialDaily,
          isFriendChallenge: isFriendChallengeActive,
          completedHistory: gameHistory,
          nextDailyStreakCount: nextDailyStreakCount || 0,
        });

        const lossGuesses = [...guessHistory, { guess: num, result: resultLabel }].map((g) => g.guess);
        addHistoryEntry({
          result: 'LOSS',
          score: lossScore,
          attempts: newAttempts,
          hintsUsed: hintsUsed,
          secretNumber,
          validGuesses: lossGuesses,
          timeRemaining: gameMode === 'timed' ? Math.max(0, timeRemaining) : null,
          attemptsRemaining: gameMode === 'limited' ? 0 : null,
          maxAttempts: gameMode === 'endless' ? endlessMaxAttempts : null,
          endlessRunId: gameMode === 'endless' ? endlessRun.runId : null,
          endlessRound: gameMode === 'endless' ? endlessRun.currentRound : 0,
          endlessStreak: gameMode === 'endless' ? endlessRun.roundsWon : 0,
          achievementsUnlocked: unlockedIds || [],
        });

        return {
          ...prev,
          totalGames: nextTotalGames,
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
      if (gameMode === 'endless' && endlessRun.active) {
        const completedRounds = endlessRun.roundsWon;
        setEndlessRun((prev) => ({ ...prev, active: false, totalGuesses: prev.totalGuesses + newAttempts, newBest: prev.newBest || completedRounds > bestEndlessStreak }));
        setBestEndlessStreak((prev) => Math.max(prev, completedRounds));
      }
    } else {
      setScore(newScore);
      setMessage(num > secretNumber ? '📉 Too High' : '📈 Too Low');

      // Update lifetime valid guesses for in-progress game valid guess
      setStatistics((prev) => ({
        ...prev,
        totalValidGuesses: prev.totalValidGuesses + 1,
      }));
    }
  }, [attempts, config.maxAttempts, config.maxNumber, difficulty, endlessRun, evaluateAchievements, gameHistory, gameMode, handleOfficialDailyCompletion, hintsUsed, isDailyChallengeActive, isFriendChallengeActive, isPracticeReplay, score, secretNumber, setBestAttempts, setBestEndlessStreak, setHighScores, setStatistics, setStreak, status, timeRemaining]);

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
    achievements,
    timeRemaining,
    hintsUsed,
    currentHint,
    hintCost,
    canAffordHint,
    unlockedThisRound,
    toastMessage,
    todayKey,
    dailyChallengeConfig,
    isCompletedToday,
    todayResult,
    dailyStreak,
    gameHistory,
    clearGameHistory,
    isDailyChallengeActive,
    isPracticeReplay,
    isFriendChallengeActive,
    friendChallengeSeed,
    profiles,
    activeProfileId,
    activeProfile,
    createProfile,
    switchProfile,
    renameProfile,
    deleteProfile,
    triggerExport,
    restoreBackup,
    changeDifficulty,
    changeGameMode,
    makeGuess,
    getHint,
    resetGame,
    resetStatistics,
    startDailyChallenge,
    startPracticeReplay,
    exitDailyChallenge,
    startFriendChallenge,
    exitFriendChallenge,
    endlessRun,
    bestEndlessStreak,
    advanceEndlessRound,
    restartGame,
  };
}
