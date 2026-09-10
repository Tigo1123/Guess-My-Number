export const ACHIEVEMENTS = [
  {
    id: 'FIRST_WIN',
    title: 'First Victory',
    description: 'Win your first game.',
  },
  {
    id: 'ON_FIRE',
    title: 'Hot Streak',
    description: 'Reach a win streak of 3.',
  },
  {
    id: 'PERFECT_GUESS',
    title: 'Perfect Guess',
    description: 'Win on your very first guess.',
  },
  {
    id: 'SHARPSHOOTER',
    title: 'Sharpshooter',
    description: 'Win a round in 3 guesses or fewer.',
  },
  {
    id: 'SPEED_DEMON',
    title: 'Speed Demon',
    description: 'Win a Timed Challenge with at least 50% time remaining.',
  },
  {
    id: 'HARD_MODE_HERO',
    title: 'Hard Mode Hero',
    description: 'Win a round on Hard difficulty.',
  },
  {
    id: 'VETERAN',
    title: 'Dedicated Player',
    description: 'Complete 10 total games.',
  },
  {
    id: 'NO_HELP_NEEDED',
    title: 'No Help Needed',
    description: 'Win a round without using any hints.',
  },
  { id: 'VETERAN_25', title: 'Veteran Player', description: 'Complete 25 total games.' },
  { id: 'CHALLENGER', title: 'Challenger', description: 'Complete a Friend Challenge.' },
  { id: 'DIFFICULTY_MASTER', title: 'Difficulty Master', description: 'Win at least one game in Easy, Medium, and Hard.' },
  { id: 'MODE_MASTER', title: 'Mode Master', description: 'Win a Classic, Timed, Limited, Daily, and Friend Challenge game.' },
  { id: 'ENDLESS_STARTER', title: 'Getting Started', description: 'Win 3 consecutive Endless rounds.' },
  { id: 'ENDLESS_UNSTOPPABLE', title: 'Unstoppable', description: 'Win 5 consecutive Endless rounds.' },
  { id: 'ENDLESS_MASTER', title: 'Endless Master', description: 'Win 10 consecutive Endless rounds.' },
  {
    id: 'DAILY_DEBUT',
    title: 'Daily Debut',
    description: 'Complete your first official Daily Challenge.',
  },
  {
    id: 'DAILY_WINNER',
    title: 'Daily Winner',
    description: 'Win an official Daily Challenge.',
  },
  {
    id: 'DAILY_STREAK_3',
    title: 'Daily Devotion',
    description: 'Reach a Daily Challenge streak of 3.',
  },
];

export const ACHIEVEMENT_IDS = ACHIEVEMENTS.map((a) => a.id);
