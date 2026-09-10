const MODE_LABELS = { classic: 'Classic', timed: 'Timed Challenge', limited: 'Limited Attempts' };

// Explicitly select public result fields; never serialize the round or profile.
export function generateShareText({ status, difficultyName, gameMode, attempts, score, streak,
  isDailyChallengeActive, isPracticeReplay, todayKey }) {
  if (status !== 'WON' && status !== 'LOST') return '';
  const lines = ['Guess My Number 🎯'];
  if (isDailyChallengeActive) {
    lines.push(isPracticeReplay ? 'Daily Challenge • Practice Replay' : 'Daily Challenge');
    if (/^\d{4}-\d{2}-\d{2}$/.test(todayKey || '')) {
      const date = new Date(`${todayKey}T00:00:00Z`);
      if (!Number.isNaN(date.getTime())) lines.push(new Intl.DateTimeFormat('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
      }).format(date));
    }
  }
  const description = [difficultyName, MODE_LABELS[gameMode]].filter(Boolean).join(' • ');
  if (description) lines.push(description);
  const hasAttempts = Number.isFinite(attempts);
  if (status === 'WON') {
    lines.push(hasAttempts ? `Won in ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}` : 'Won');
    if (Number.isFinite(score)) lines.push(`Score: ${score}`);
    if (Number.isFinite(streak)) lines.push(`🔥 Streak: ${streak}`);
  } else {
    lines.push('Game over');
    if (hasAttempts) lines.push(`Attempts: ${attempts}`);
    lines.push('Better luck next round!');
  }
  return lines.join('\n');
}
