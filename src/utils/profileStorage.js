import {
  sanitizeHighScores,
  sanitizeStatistics,
  sanitizeStreak,
  sanitizeBestAttempts,
  sanitizeAchievements,
  sanitizeDailyChallengeHistory,
  sanitizeDailyStreak,
  INITIAL_STATISTICS,
  INITIAL_STREAK,
  INITIAL_BEST_ATTEMPTS,
  INITIAL_DAILY_STREAK,
} from '../hooks/useGameState';

export const PROFILES_STORAGE_KEY = 'guess_my_number_profiles';

export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if randomUUID fails in certain environments
    }
  }
  return 'prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export function validateProfileName(name, existingProfiles = [], currentProfileId = null) {
  const trimmed = typeof name === 'string' ? name.trim() : '';

  if (!trimmed) {
    return { valid: false, error: 'Name cannot be empty' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Name must be 1 to 20 characters' };
  }

  const lowerName = trimmed.toLowerCase();
  const isDuplicate = existingProfiles.some(
    (p) => p.id !== currentProfileId && typeof p.name === 'string' && p.name.trim().toLowerCase() === lowerName
  );

  if (isDuplicate) {
    return { valid: false, error: 'A player with this name already exists' };
  }

  return { valid: true, name: trimmed };
}

function sanitizeNonNegativeInt(val) {
  if (typeof val === 'number' && Number.isFinite(val) && Number.isInteger(val) && val >= 0) {
    return val;
  }
  return 0;
}

export function sanitizeGameHistory(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  const validEntries = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;

    const id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : generateUUID();
    const playedAt = typeof entry.playedAt === 'string' && entry.playedAt ? entry.playedAt : new Date().toISOString();
    const result = entry.result === 'WIN' ? 'WIN' : 'LOSS';
    const difficulty = ['easy', 'medium', 'hard'].includes(entry.difficulty) ? entry.difficulty : 'easy';
    const mode = ['classic', 'timed', 'limited'].includes(entry.mode) ? entry.mode : 'classic';
    const score = sanitizeNonNegativeInt(entry.score);
    const attempts = sanitizeNonNegativeInt(entry.attempts);
    const hintsUsed = sanitizeNonNegativeInt(entry.hintsUsed);
    const secretNumber = typeof entry.secretNumber === 'number' && entry.secretNumber > 0 ? entry.secretNumber : 1;
    const validGuesses = Array.isArray(entry.validGuesses)
      ? entry.validGuesses.filter((n) => typeof n === 'number' && Number.isInteger(n))
      : [];
    const timeRemaining = typeof entry.timeRemaining === 'number' && entry.timeRemaining >= 0 ? entry.timeRemaining : null;
    const maxTime = typeof entry.maxTime === 'number' && entry.maxTime > 0 ? entry.maxTime : null;
    const maxAttempts = typeof entry.maxAttempts === 'number' && entry.maxAttempts > 0 ? entry.maxAttempts : null;
    const attemptsRemaining = typeof entry.attemptsRemaining === 'number' && entry.attemptsRemaining >= 0 ? entry.attemptsRemaining : null;
    const isDailyChallenge = Boolean(entry.isDailyChallenge);
    const dailyChallengeType = ['official', 'practice'].includes(entry.dailyChallengeType) ? entry.dailyChallengeType : null;
    const dailyDateKey = typeof entry.dailyDateKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.dailyDateKey) ? entry.dailyDateKey : null;
    const achievementsUnlocked = sanitizeAchievements(entry.achievementsUnlocked);

    validEntries.push({
      id,
      playedAt,
      result,
      difficulty,
      mode,
      score,
      attempts,
      hintsUsed,
      secretNumber,
      validGuesses,
      timeRemaining,
      maxTime,
      maxAttempts,
      attemptsRemaining,
      isDailyChallenge,
      dailyChallengeType,
      dailyDateKey,
      achievementsUnlocked,
    });
  }

  // Keep latest 100 entries only
  return validEntries.slice(-100);
}

export function createEmptyProgress() {
  return {
    highScores: { easy: 0, medium: 0, hard: 0 },
    statistics: { ...INITIAL_STATISTICS },
    streak: { ...INITIAL_STREAK },
    bestAttempts: { ...INITIAL_BEST_ATTEMPTS },
    achievements: [],
    dailyChallengeHistory: {},
    dailyStreak: { ...INITIAL_DAILY_STREAK },
    gameHistory: [],
  };
}

export function sanitizeProgress(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return createEmptyProgress();
  }

  return {
    highScores: sanitizeHighScores(raw.highScores),
    statistics: sanitizeStatistics(raw.statistics),
    streak: sanitizeStreak(raw.streak),
    bestAttempts: sanitizeBestAttempts(raw.bestAttempts),
    achievements: sanitizeAchievements(raw.achievements),
    dailyChallengeHistory: sanitizeDailyChallengeHistory(raw.dailyChallengeHistory),
    dailyStreak: sanitizeDailyStreak(raw.dailyStreak),
    gameHistory: sanitizeGameHistory(raw.gameHistory),
  };
}

export function sanitizeProfilesPayload(raw) {
  const defaultProfileId = generateUUID();
  const now = new Date().toISOString();

  const defaultProfile = {
    id: defaultProfileId,
    name: 'Player 1',
    createdAt: now,
    updatedAt: now,
    progress: createEmptyProgress(),
  };

  const defaultPayload = {
    version: 1,
    activeProfileId: defaultProfileId,
    profiles: [defaultProfile],
  };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return defaultPayload;
  }

  const rawProfiles = Array.isArray(raw.profiles) ? raw.profiles : [];
  const validProfiles = [];
  const usedIds = new Set();
  const usedNames = new Set();

  for (let i = 0; i < rawProfiles.length; i++) {
    const p = rawProfiles[i];
    if (!p || typeof p !== 'object' || Array.isArray(p)) continue;

    let id = typeof p.id === 'string' && p.id.trim() ? p.id.trim() : generateUUID();
    while (usedIds.has(id)) {
      id = generateUUID();
    }
    usedIds.add(id);

    let rawName = typeof p.name === 'string' ? p.name.trim() : `Player ${i + 1}`;
    if (!rawName || rawName.length > 20) {
      rawName = `Player ${i + 1}`;
    }

    let uniqueName = rawName;
    let counter = 2;
    while (usedNames.has(uniqueName.toLowerCase())) {
      const candidate = `${rawName.slice(0, 16)} ${counter}`;
      uniqueName = candidate.length > 20 ? candidate.slice(0, 20) : candidate;
      counter++;
    }
    usedNames.add(uniqueName.toLowerCase());

    const createdAt = typeof p.createdAt === 'string' && p.createdAt ? p.createdAt : now;
    const updatedAt = typeof p.updatedAt === 'string' && p.updatedAt ? p.updatedAt : now;
    const progress = sanitizeProgress(p.progress);

    validProfiles.push({
      id,
      name: uniqueName,
      createdAt,
      updatedAt,
      progress,
    });
  }

  if (validProfiles.length === 0) {
    return defaultPayload;
  }

  let activeProfileId = typeof raw.activeProfileId === 'string' ? raw.activeProfileId.trim() : '';
  if (!validProfiles.some((p) => p.id === activeProfileId)) {
    activeProfileId = validProfiles[0].id;
  }

  return {
    version: 1,
    activeProfileId,
    profiles: validProfiles,
  };
}

export function migrateLegacyDataToProfiles() {
  const getStoredItem = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  };

  const highScores = sanitizeHighScores(getStoredItem('guess_my_number_highscores'));
  const statistics = sanitizeStatistics(getStoredItem('guess_my_number_statistics'));
  const streak = sanitizeStreak(getStoredItem('guess_my_number_streak'));
  const bestAttempts = sanitizeBestAttempts(getStoredItem('guess_my_number_best_attempts'));
  const achievements = sanitizeAchievements(getStoredItem('guess_my_number_achievements'));
  const dailyChallengeHistory = sanitizeDailyChallengeHistory(getStoredItem('guess_my_number_daily_challenge'));
  const dailyStreak = sanitizeDailyStreak(getStoredItem('guess_my_number_daily_streak'));

  const legacyProgress = {
    highScores,
    statistics,
    streak,
    bestAttempts,
    achievements,
    dailyChallengeHistory,
    dailyStreak,
  };

  const defaultProfileId = generateUUID();
  const now = new Date().toISOString();

  return {
    version: 1,
    activeProfileId: defaultProfileId,
    profiles: [
      {
        id: defaultProfileId,
        name: 'Player 1',
        createdAt: now,
        updatedAt: now,
        progress: legacyProgress,
      },
    ],
  };
}

export function loadProfilesFromStorage() {
  try {
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!stored) {
      const migrated = migrateLegacyDataToProfiles();
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    const parsed = JSON.parse(stored);
    const sanitized = sanitizeProfilesPayload(parsed);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch {
    const fallback = migrateLegacyDataToProfiles();
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(fallback));
    } catch {
      // Ignore storage write errors
    }
    return fallback;
  }
}

export function saveProfilesToStorage(profilesPayload) {
  const sanitized = sanitizeProfilesPayload(profilesPayload);
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // Ignore storage write errors
  }
  return sanitized;
}
