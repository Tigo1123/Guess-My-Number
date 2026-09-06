import React from 'react';
import { DIFFICULTIES } from '../constants/difficulty';

export function DifficultySelector({ activeDifficulty, onSelectDifficulty }) {
  return (
    <section className="difficulty">
      {Object.values(DIFFICULTIES).map((level) => {
        const isActive = activeDifficulty === level.id;
        return (
          <button
            key={level.id}
            type="button"
            className={`difficulty--btn ${isActive ? 'active' : ''}`}
            data-level={level.id}
            onClick={() => onSelectDifficulty(level.id)}
          >
            {level.name}
          </button>
        );
      })}
    </section>
  );
}
