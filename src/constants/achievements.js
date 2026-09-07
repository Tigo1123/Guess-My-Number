export const ACHIEVEMENTS = [
  {
    id: 'FIRST_WIN',
    title: 'First Victory',
    description: 'Win your first game.',
  },
  {
    id: 'ON_FIRE',
    title: 'On Fire',
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
    title: 'Veteran',
    description: 'Complete 10 total games.',
  },
  {
    id: 'NO_HELP_NEEDED',
    title: 'No Help Needed',
    description: 'Win a round without using any hints.',
  },
];

export const ACHIEVEMENT_IDS = ACHIEVEMENTS.map((a) => a.id);
