const DIFFICULTIES = ['easy', 'medium', 'hard'];
const MODES = ['classic', 'timed', 'limited', 'daily', 'friend'];

const finiteNonNegative = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isWin = (game) => game?.result === 'WIN' || game?.result === 'WON' || game?.won === true;
const difficultyOf = (game) => DIFFICULTIES.includes(game?.difficulty) ? game.difficulty : null;
const modeOf = (game) => game?.isFriendChallenge ? 'friend' : game?.isDailyChallenge || game?.dailyDateKey ? 'daily' : MODES.includes(game?.mode) ? game.mode : null;
const attemptsOf = (game) => finiteNonNegative(game?.attempts) ? game.attempts : null;

const emptyDifficulty = () => ({ games: 0, wins: 0, losses: 0, winRate: null, averageAttempts: null });
const emptyMode = () => ({ games: 0, wins: 0, losses: 0, winRate: null });

export function calculateDifficultyStats(history = []) {
  const stats = Object.fromEntries(DIFFICULTIES.map((key) => [key, emptyDifficulty()]));
  (Array.isArray(history) ? history : []).forEach((game) => {
    const key = difficultyOf(game);
    if (!key) return;
    const item = stats[key];
    item.games += 1;
    if (isWin(game)) item.wins += 1; else item.losses += 1;
  });
  Object.entries(stats).forEach(([key, item]) => {
    if (item.games) {
      item.winRate = Math.round((item.wins / item.games) * 100);
      const attempts = (Array.isArray(history) ? history : []).filter((g) => difficultyOf(g) === key).map(attemptsOf).filter((n) => n !== null);
      item.averageAttempts = attempts.length ? Number((attempts.reduce((sum, n) => sum + n, 0) / attempts.length).toFixed(1)) : null;
    }
  });
  return stats;
}

export function calculateModeStats(history = []) {
  const stats = Object.fromEntries(MODES.map((key) => [key, emptyMode()]));
  (Array.isArray(history) ? history : []).forEach((game) => {
    const key = modeOf(game);
    if (!key) return;
    stats[key].games += 1;
    if (isWin(game)) stats[key].wins += 1; else stats[key].losses += 1;
  });
  Object.values(stats).forEach((item) => { if (item.games) item.winRate = Math.round((item.wins / item.games) * 100); });
  return stats;
}

export function calculateRecentPerformance(history = []) {
  return (Array.isArray(history) ? history : []).slice(-10).reverse().map((game, index) => ({
    ...game,
    index: index + 1,
    outcome: isWin(game) ? 'Win' : 'Loss',
    difficulty: difficultyOf(game),
    mode: modeOf(game),
    attempts: attemptsOf(game),
  }));
}

export function calculatePlayerAnalytics(history = []) {
  const games = Array.isArray(history) ? history.filter((game) => game && typeof game === 'object') : [];
  const wins = games.filter(isWin).length;
  const attempts = games.map(attemptsOf).filter((n) => n !== null);
  const recent = calculateRecentPerformance(games);
  const recentWins = recent.filter((game) => game.outcome === 'Win').length;
  const difficultyStats = calculateDifficultyStats(games);
  const modeStats = calculateModeStats(games);
  const playedDifficulty = DIFFICULTIES.filter((key) => difficultyStats[key].games);
  const playedModes = MODES.filter((key) => modeStats[key].games);
  const bestDifficulty = playedDifficulty.length ? playedDifficulty.reduce((best, key) => {
    const current = difficultyStats[key];
    const prior = difficultyStats[best];
    return current.winRate > prior.winRate || (current.winRate === prior.winRate && current.games > prior.games) ? key : best;
  }, playedDifficulty[0]) : null;
  const mostPlayedDifficulty = playedDifficulty.length ? playedDifficulty.reduce((best, key) => difficultyStats[key].games > difficultyStats[best].games ? key : best, playedDifficulty[0]) : null;
  const mostPlayedMode = playedModes.length ? playedModes.reduce((best, key) => modeStats[key].games > modeStats[best].games ? key : best, playedModes[0]) : null;
  let currentStreak = 0;
  for (let i = games.length - 1; i >= 0 && isWin(games[i]); i -= 1) currentStreak += 1;
  let bestStreak = 0;
  let running = 0;
  games.forEach((game) => { running = isWin(game) ? running + 1 : 0; bestStreak = Math.max(bestStreak, running); });
  const analytics = {
    totalGames: games.length, totalWins: wins, totalLosses: games.length - wins,
    averageAttempts: attempts.length ? Number((attempts.reduce((sum, n) => sum + n, 0) / attempts.length).toFixed(1)) : null,
    bestDifficulty, mostPlayedDifficulty, mostPlayedMode,
    winRate: games.length ? Math.round((wins / games.length) * 100) : null,
    recentWinRate: recent.length ? Math.round((recentWins / recent.length) * 100) : null,
    currentStreak, bestStreak, difficultyStats, modeStats, recent,
  };
  // Descriptive aliases keep the utility convenient for other Stats consumers.
  analytics.last10WinRate = analytics.recentWinRate;
  analytics.averageAttemptsByDifficulty = Object.fromEntries(DIFFICULTIES.map((key) => [key, difficultyStats[key].averageAttempts]));
  analytics.winsByDifficulty = Object.fromEntries(DIFFICULTIES.map((key) => [key, difficultyStats[key].wins]));
  analytics.lossesByDifficulty = Object.fromEntries(DIFFICULTIES.map((key) => [key, difficultyStats[key].losses]));
  analytics.winRateByMode = Object.fromEntries(MODES.map((key) => [key, modeStats[key].winRate]));
  return analytics;
}

export function generatePlayerInsight(analytics) {
  if (!analytics || !analytics.totalGames) return 'Play more games to unlock performance insights.';
  if (analytics.recent.length >= 2 && analytics.recentWinRate > analytics.winRate) return 'Your win rate improved in your last 10 games.';
  if (analytics.bestDifficulty) return `Your strongest difficulty is ${analytics.bestDifficulty[0].toUpperCase()}${analytics.bestDifficulty.slice(1)}.`;
  if (analytics.mostPlayedMode) return `You play ${analytics.mostPlayedMode === 'daily' ? 'Daily Challenge' : analytics.mostPlayedMode[0].toUpperCase() + analytics.mostPlayedMode.slice(1)} most often.`;
  return 'Keep playing to reveal more performance insights.';
}

export const analyticsLabels = {
  difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
  mode: { classic: 'Classic', timed: 'Timed', limited: 'Limited', daily: 'Daily', friend: 'Friend Challenge' },
};
