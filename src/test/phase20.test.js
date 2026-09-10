import { describe, it, expect } from 'vitest';
import { calculateAchievementProgress, getAchievementProgress } from '../utils/achievements';
import { getDailyMissions, calculateMissionProgress, calculateDailyMissionProgress, getDateKey } from '../utils/missions';

const day = '2026-09-10T12:00:00.000Z';
const game = (overrides = {}) => ({ result: 'WIN', difficulty: 'medium', mode: 'classic', playedAt: day, hintsUsed: 0, ...overrides });

describe('expanded achievement calculations', () => {
  it('unlocks and tracks a three win streak', () => {
    const progress = calculateAchievementProgress([game(), game(), game()], 3);
    expect(progress.unlocked.HOT_STREAK).toBe(true);
    expect(getAchievementProgress('ON_FIRE', progress)).toEqual([3, 3]);
  });
  it('does not unlock a two win streak', () => expect(calculateAchievementProgress([game(), game()], 2).unlocked.HOT_STREAK).toBe(false));
  it('recognizes friend challenges', () => expect(calculateAchievementProgress([game({ isFriendChallenge: true })]).unlocked.CHALLENGER).toBe(true));
  it('requires all three winning difficulties', () => {
    const progress = calculateAchievementProgress([game({ difficulty: 'easy' }), game({ difficulty: 'medium' }), game({ difficulty: 'hard' })]);
    expect(progress.unlocked.DIFFICULTY_MASTER).toBe(true);
    expect(getAchievementProgress('DIFFICULTY_MASTER', progress)).toEqual([3, 3]);
  });
  it('keeps difficulty master locked when one difficulty is missing', () => expect(calculateAchievementProgress([game({ difficulty: 'easy' }), game({ difficulty: 'hard' })]).unlocked.DIFFICULTY_MASTER).toBe(false));
  it('requires every supported winning mode', () => {
    const modes = ['classic', 'timed', 'limited'].map((mode) => game({ mode }));
    const progress = calculateAchievementProgress([...modes, game({ isDailyChallenge: true }), game({ isFriendChallenge: true })]);
    expect(progress.unlocked.MODE_MASTER).toBe(true);
  });
  it('tracks no hint wins and rejects hinted wins', () => {
    expect(calculateAchievementProgress([game({ hintsUsed: 0 })]).unlocked.NO_HELP_NEEDED).toBe(true);
    expect(calculateAchievementProgress([game({ hintsUsed: 1 })]).unlocked.NO_HELP_NEEDED).toBe(false);
  });
  it('counts completed games at 10 and 25', () => {
    expect(calculateAchievementProgress(Array.from({ length: 9 }, () => game())).unlocked.DEDICATED_PLAYER).toBe(false);
    const progress = calculateAchievementProgress(Array.from({ length: 25 }, () => game()));
    expect(progress.unlocked.DEDICATED_PLAYER).toBe(true);
    expect(progress.unlocked.VETERAN_25).toBe(true);
    expect(getAchievementProgress('VETERAN_25', progress)).toEqual([25, 25]);
  });
  it('ignores malformed records and isolates separate histories', () => {
    const progress = calculateAchievementProgress([null, {}, { result: 'BROKEN' }, game()]);
    expect(progress.games).toBe(1);
    expect(calculateAchievementProgress([]).wins).toBe(0);
  });
  it('keeps achievement progress isolated when active player histories switch', () => {
    const playerA = calculateAchievementProgress(Array.from({ length: 10 }, () => game()));
    const playerB = calculateAchievementProgress([game({ result: 'LOSS', hintsUsed: 2 })]);
    expect(playerA.unlocked.DEDICATED_PLAYER).toBe(true);
    expect(playerB.unlocked.DEDICATED_PLAYER).toBe(false);
    expect(playerB.wins).toBe(0);
  });
});

describe('deterministic local missions', () => {
  it('creates exactly three stable missions per local date', () => {
    const first = getDailyMissions(new Date(day));
    expect(first).toHaveLength(3);
    expect(first.map((m) => m.id)).toEqual(getDailyMissions(new Date(day)).map((m) => m.id));
    expect(new Set(first.map((m) => m.id)).size).toBe(3);
  });
  it('rotates missions across dates and exposes valid mission metadata', () => {
    const sets = [1, 2, 3, 4, 5].map((offset) => getDailyMissions(new Date(`2026-09-${String(offset).padStart(2, '0')}T12:00:00`)).map((m) => m.id).join(','));
    expect(new Set(sets).size).toBeGreaterThan(1);
    expect(getDailyMissions(new Date(day)).every((m) => m.id && m.title && Number.isFinite(m.goal))).toBe(true);
  });
  it('calculates win, play, difficulty, friend and no hint progress', () => {
    const history = [game(), game({ result: 'LOSS' }), game({ result: 'LOSS', difficulty: 'hard', isFriendChallenge: true })];
    const missions = getDailyMissions(new Date(day));
    expect(calculateMissionProgress({ ...missions[0], test: () => true, goal: 1 }, history, new Date(day)).progress).toBe(1);
    expect(calculateMissionProgress({ id: 'play', title: 'Play', description: '', goal: 3, test: () => true }, history, new Date(day)).label).toBe('3 / 3');
    expect(calculateMissionProgress({ id: 'hard', title: 'Hard', description: '', goal: 1, test: (g) => g.result === 'WIN' && g.difficulty === 'hard' }, history, new Date(day)).completed).toBe(false);
    expect(calculateMissionProgress({ id: 'friend', title: 'Friend', description: '', goal: 1, test: (g) => g.isFriendChallenge }, history, new Date(day)).completed).toBe(true);
    expect(calculateMissionProgress({ id: 'hint', title: 'Hint', description: '', goal: 1, test: (g) => g.result === 'WIN' && g.hintsUsed === 0 }, history, new Date(day)).completed).toBe(true);
  });
  it('ignores old dates and malformed records without NaN', () => {
    const progress = calculateDailyMissionProgress([{ result: 'WIN', playedAt: '2020-01-01' }, null, {}], new Date(day));
    expect(progress).toHaveLength(3);
    expect(progress.every((m) => Number.isFinite(m.progress) && typeof m.label === 'string')).toBe(true);
    expect(getDateKey(new Date(day))).toBe('2026-09-10');
  });
});
