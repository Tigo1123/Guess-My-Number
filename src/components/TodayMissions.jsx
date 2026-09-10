import React, { useEffect, useMemo, useState } from 'react';
import { calculateDailyMissionProgress, getDateKey } from '../utils/missions';

export function TodayMissions({ history = [], date }) {
  const [today, setToday] = useState(() => getDateKey(date || new Date()));
  useEffect(() => { const timer = window.setInterval(() => setToday(getDateKey(new Date())), 60000); return () => window.clearInterval(timer); }, []);
  const missionDate = date || new Date(`${today}T12:00:00`);
  const missions = useMemo(() => calculateDailyMissionProgress(history, missionDate), [history, missionDate]);
  return <section className="summary-card-block" aria-label="Today's Missions"><h2 className="section-title">Today's Missions</h2><div className="mission-grid">{missions.map((mission) => <article className={`mission-card ${mission.completed ? 'completed' : ''}`} key={mission.id}><div className="mission-card-header"><h3>{mission.title}</h3><span>{mission.completed ? 'COMPLETED' : mission.label}</span></div><p>{mission.description}</p><progress max={mission.goal} value={mission.progress} aria-label={`${mission.title}: ${mission.label}`} /><strong>{mission.label}</strong></article>)}</div></section>;
}
