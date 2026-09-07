import React from 'react';
import { DIFFICULTIES } from '../constants/difficulty';

export function DifficultySelector({ activeDifficulty, onSelectDifficulty, disabled }) {
  return (
    <section className="difficulty-selector difficulty" aria-label="Select Difficulty">
      <span className="selector-label">Difficulty</span>
      <div className="difficulty-buttons" role="group" aria-label="Difficulty Levels">
        {Object.values(DIFFICULTIES).map((level) => {
          const isActive = activeDifficulty === level.id;
          return (
            <button
              key={level.id}
              type="button"
              className={`difficulty-btn difficulty--btn ${isActive ? 'active' : ''}`}
              data-level={level.id}
              aria-pressed={isActive}
              onClick={() => onSelectDifficulty(level.id)}
              disabled={disabled}
            >
              {level.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
