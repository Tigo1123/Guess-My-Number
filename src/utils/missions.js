const MISSION_POOL = [
  { id: 'win_one', title: 'Win 1 Game', description: 'Win any game.', goal: 1, test: (g) => g.result === 'WIN' },
  { id: 'play_three', title: 'Play 3 Games', description: 'Complete three games.', goal: 3, test: () => true },
  { id: 'win_medium', title: 'Medium Win', description: 'Win on Medium.', goal: 1, test: (g) => g.result === 'WIN' && g.difficulty === 'medium' },
  { id: 'win_hard', title: 'Hard Win', description: 'Win on Hard.', goal: 1, test: (g) => g.result === 'WIN' && g.difficulty === 'hard' },
  { id: 'no_hint', title: 'No Help Needed', description: 'Win without a hint.', goal: 1, test: (g) => g.result === 'WIN' && g.hintsUsed === 0 },
  { id: 'friend', title: 'Friend Challenge', description: 'Complete a Friend Challenge.', goal: 1, test: (g) => Boolean(g.isFriendChallenge) },
  { id: 'classic_win', title: 'Classic Win', description: 'Win a Classic game.', goal: 1, test: (g) => g.result === 'WIN' && g.mode === 'classic' && !g.isFriendChallenge },
  { id: 'timed_win', title: 'Timed Win', description: 'Win a Timed game.', goal: 1, test: (g) => g.result === 'WIN' && g.mode === 'timed' },
  { id: 'limited_win', title: 'Limited Win', description: 'Win a Limited game.', goal: 1, test: (g) => g.result === 'WIN' && g.mode === 'limited' },
];
export function getDateKey(date = new Date()) { const d = new Date(date); if (Number.isNaN(d.getTime())) return ''; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function getDailyMissions(date = new Date()) { const key = getDateKey(date); let hash = 0; for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0; const selected = []; for (let i = 0; selected.length < 3; i += 1) { const mission = MISSION_POOL[(hash + i * 7) % MISSION_POOL.length]; if (!selected.some((item) => item.id === mission.id)) selected.push(mission); } return selected; }
export function calculateMissionProgress(mission, history = [], date = new Date()) { const today = getDateKey(date); const games = (Array.isArray(history) ? history : []).filter((game) => game?.playedAt && getDateKey(game.playedAt) === today); const count = games.filter(mission.test).length; return { ...mission, progress: Math.min(mission.goal, count), completed: count >= mission.goal, label: mission.goal === 1 ? (count >= 1 ? 'Completed' : '0 / 1') : `${Math.min(mission.goal, count)} / ${mission.goal}` }; }
export function calculateDailyMissionProgress(history = [], date = new Date()) { return getDailyMissions(date).map((mission) => calculateMissionProgress(mission, history, date)); }
