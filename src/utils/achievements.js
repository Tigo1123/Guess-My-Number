const WIN = (game) => game?.result === 'WIN';
const mode = (game) => game?.isFriendChallenge ? 'friend' : game?.isDailyChallenge ? 'daily' : game?.mode;
const valid = (history) => Array.isArray(history) ? history.filter((game) => game && typeof game === 'object' && ['WIN', 'LOSS'].includes(game.result)) : [];

export function calculateAchievementProgress(history = [], streak = 0) {
  const games = valid(history); const wins = games.filter(WIN); const difficulties = new Set(wins.map((game) => game.difficulty).filter((key) => ['easy', 'medium', 'hard'].includes(key)));
  const modes = new Set(wins.map(mode).filter((key) => ['classic', 'timed', 'limited', 'daily', 'friend'].includes(key)));
  const derivedStreak = games.reduce((run, game) => game.result === 'WIN' ? run + 1 : 0, 0);
  const currentStreak = Number.isFinite(streak) && streak >= 0 ? streak : derivedStreak;
  const endlessRuns = new Map();
  games.filter((game) => game.mode === 'endless' && game.endlessRunId).forEach((game) => {
    const run = endlessRuns.get(game.endlessRunId) || 0;
    endlessRuns.set(game.endlessRunId, Math.max(run, game.endlessStreak || (game.result === 'WIN' ? 1 : 0)));
  });
  const bestEndlessStreak = Math.max(0, ...endlessRuns.values());
  return {
    games: games.length, wins: wins.length, hotStreak: Math.min(3, currentStreak), difficulties: difficulties.size, modes: modes.size, bestEndlessStreak,
    unlocked: { HOT_STREAK: currentStreak >= 3, CHALLENGER: games.some((game) => game.isFriendChallenge), DIFFICULTY_MASTER: difficulties.size >= 3, MODE_MASTER: modes.size >= 5, NO_HELP_NEEDED: wins.some((game) => game.hintsUsed === 0), DEDICATED_PLAYER: games.length >= 10, VETERAN_25: games.length >= 25, ENDLESS_STARTER: bestEndlessStreak >= 3, ENDLESS_UNSTOPPABLE: bestEndlessStreak >= 5, ENDLESS_MASTER: bestEndlessStreak >= 10 },
  };
}

export function getAchievementProgress(id, progress) {
  const map = { ON_FIRE: [progress.hotStreak, 3], CHALLENGER: [progress.unlocked.CHALLENGER ? 1 : 0, 1], DIFFICULTY_MASTER: [progress.difficulties, 3], MODE_MASTER: [progress.modes, 5], NO_HELP_NEEDED: [progress.unlocked.NO_HELP_NEEDED ? 1 : 0, 1], VETERAN: [Math.min(progress.games, 10), 10], VETERAN_25: [Math.min(progress.games, 25), 25], ENDLESS_STARTER: [Math.min(progress.bestEndlessStreak, 3), 3], ENDLESS_UNSTOPPABLE: [Math.min(progress.bestEndlessStreak, 5), 5], ENDLESS_MASTER: [Math.min(progress.bestEndlessStreak, 10), 10] };
  return map[id] || null;
}
