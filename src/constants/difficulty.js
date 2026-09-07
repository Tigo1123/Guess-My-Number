export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    name: 'Easy',
    maxNumber: 20,
    startingScore: 20,
    timedDuration: 60,
    maxAttempts: 10,
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    maxNumber: 50,
    startingScore: 15,
    timedDuration: 45,
    maxAttempts: 7,
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    maxNumber: 100,
    startingScore: 10,
    timedDuration: 30,
    maxAttempts: 5,
  },
};

export const DEFAULT_DIFFICULTY = 'easy';
