import React from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';

export function Achievements({ unlockedAchievements = [] }) {
  const unlockedSet = new Set(unlockedAchievements);
  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = unlockedSet.size;

  return (
    <section className="summary-card-block" aria-label="Game Achievements">
      <div className="section-header-row">
        <h2 className="section-title">Achievements</h2>
        <span className="section-badge-counter">
          {unlockedCount} / {totalCount} Unlocked
        </span>
      </div>

      <div className="achievements-compact-grid">
        {ACHIEVEMENTS.map((item) => {
          const isUnlocked = unlockedSet.has(item.id);
          return (
            <div
              key={item.id}
              className={`achievement-card-compact ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-card-top">
                <span className="achievement-title-text">{item.title}</span>
                <span className={`achievement-status-badge ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <p className="achievement-desc-text">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
