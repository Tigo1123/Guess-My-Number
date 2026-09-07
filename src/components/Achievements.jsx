import React from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';

export function Achievements({ unlockedAchievements = [] }) {
  const unlockedSet = new Set(unlockedAchievements);
  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = unlockedSet.size;

  return (
    <section className="achievements-container" aria-label="Game Achievements">
      <div className="achievements-header">
        <h2 className="achievements-title">ACHIEVEMENTS</h2>
        <span className="achievements-counter">
          {unlockedCount} / {totalCount} Unlocked
        </span>
      </div>

      <div className="achievements-grid">
        {ACHIEVEMENTS.map((item) => {
          const isUnlocked = unlockedSet.has(item.id);
          return (
            <div
              key={item.id}
              className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {isUnlocked ? '🏆' : '🔒'}
              </div>
              <div className="achievement-details">
                <div className="achievement-name">{item.title}</div>
                <div className="achievement-desc">{item.description}</div>
              </div>
              <div className="achievement-status">
                {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
