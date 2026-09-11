import React from 'react';
import { ACHIEVEMENTS } from '../constants/achievements';
import { calculateAchievementProgress, getAchievementProgress } from '../utils/achievements';
import { AppImage } from './AppImage';
import { ACHIEVEMENT_IMAGES } from '../utils/imageAssets';

export function Achievements({ unlockedAchievements = [], history = [], streak = 0 }) {
  const unlockedSet = new Set(unlockedAchievements);
  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = unlockedSet.size;
  const progress = calculateAchievementProgress(history, streak);

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
                {ACHIEVEMENT_IMAGES[item.id] && <AppImage src={ACHIEVEMENT_IMAGES[item.id]} alt={`${item.title} achievement badge`} className="artwork-achievement achievement-image" />}
                <span className="achievement-title-text">{item.title}</span>
                <span className={`achievement-status-badge ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                </span>
              </div>
              <p className="achievement-desc-text">{item.description}</p>
              {getAchievementProgress(item.id, progress) && <>
                <span className="achievement-progress-text">Progress: {getAchievementProgress(item.id, progress)[0]} / {getAchievementProgress(item.id, progress)[1]}</span>
                <progress className="achievement-progress" max={getAchievementProgress(item.id, progress)[1]} value={getAchievementProgress(item.id, progress)[0]} aria-label={`${item.title}: ${getAchievementProgress(item.id, progress)[0]} of ${getAchievementProgress(item.id, progress)[1]}`} />
              </>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
