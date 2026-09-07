import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from './components/DifficultySelector';
import { SecretNumberDisplay } from './components/SecretNumberDisplay';
import { GameStatusMessage } from './components/GameStatusMessage';
import { ProximityIndicator } from './components/ProximityIndicator';
import { StreakDisplay } from './components/StreakDisplay';
import { TimerDisplay } from './components/TimerDisplay';
import { AttemptsRemainingDisplay } from './components/AttemptsRemainingDisplay';
import { DailyChallengePanel } from './components/DailyChallengePanel';
import { HintControls } from './components/HintControls';
import { GuessForm } from './components/GuessForm';
import { ScoreBoard } from './components/ScoreBoard';
import { RoundSummary } from './components/RoundSummary';
import { GuessHistory } from './components/GuessHistory';
import { ActionControls } from './components/ActionControls';
import { Achievements } from './components/Achievements';
import { AchievementToast } from './components/AchievementToast';
import { ProfileManager } from './components/ProfileManager';
import { ProfileSummary } from './components/ProfileSummary';
import { LocalLeaderboard } from './components/LocalLeaderboard';
import { ProgressBackupControls } from './components/ProgressBackupControls';
import { PersonalRecords } from './components/PersonalRecords';
import { GameHistory as CompletedGameHistory } from './components/GameHistory';
import { useGameState } from './hooks/useGameState';
import { useSoundEffects } from './hooks/useSoundEffects';

export function App() {
  const {
    difficulty,
    gameMode,
    config,
    secretNumber,
    score,
    highScore,
    status,
    guessInput,
    setGuessInput,
    message,
    attempts,
    guessHistory,
    proximity,
    isInvalid,
    resetToken,
    statistics,
    streak,
    bestAttempts,
    achievements,
    timeRemaining,
    hintsUsed,
    currentHint,
    hintCost,
    canAffordHint,
    unlockedThisRound,
    toastMessage,
    todayKey,
    dailyChallengeConfig,
    isCompletedToday,
    todayResult,
    dailyStreak,
    gameHistory,
    clearGameHistory,
    isDailyChallengeActive,
    isPracticeReplay,
    profiles,
    activeProfileId,
    activeProfile,
    createProfile,
    switchProfile,
    renameProfile,
    deleteProfile,
    triggerExport,
    restoreBackup,
    changeDifficulty,
    changeGameMode,
    makeGuess,
    getHint,
    resetGame,
    resetStatistics,
    startDailyChallenge,
    startPracticeReplay,
    exitDailyChallenge,
  } = useGameState();

  const {
    soundEnabled,
    toggleSound,
    playCorrect,
    playWrong,
    playAchievement,
    playTimeWarning,
  } = useSoundEffects();

  const isGameOver = status !== 'PLAYING';

  // Sound triggers on state changes
  useEffect(() => {
    if (status === 'WON') {
      playCorrect();
    } else if (status === 'LOST') {
      playWrong();
    }
  }, [playCorrect, playWrong, status]);

  useEffect(() => {
    if (toastMessage) {
      playAchievement();
    }
  }, [playAchievement, toastMessage]);

  useEffect(() => {
    if (gameMode === 'timed' && status === 'PLAYING' && timeRemaining === 5) {
      playTimeWarning();
    }
  }, [gameMode, playTimeWarning, status, timeRemaining]);

  // Synchronize document.body class for background colors
  useEffect(() => {
    document.body.className = '';
    if (status === 'WON') {
      document.body.classList.add('won');
    } else if (status === 'LOST') {
      document.body.classList.add('lost');
    } else {
      document.body.classList.add(difficulty);
    }
  }, [difficulty, status]);

  const handleGuessSubmit = (rawGuess) => {
    makeGuess(rawGuess);
  };

  return (
    <main className="terminal">
      <AchievementToast toastMessage={toastMessage} />

      <Header />

      <div className="sound-toggle-bar">
        <button
          type="button"
          className={`btn-sound ${soundEnabled ? 'active' : ''}`}
          aria-pressed={soundEnabled}
          onClick={toggleSound}
        >
          🔊 Sound: {soundEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <ProfileManager
        profiles={profiles}
        activeProfileId={activeProfileId}
        activeProfile={activeProfile}
        onCreateProfile={createProfile}
        onSwitchProfile={switchProfile}
        onRenameProfile={renameProfile}
        onDeleteProfile={deleteProfile}
      />

      <div className="divider" />

      <DailyChallengePanel
        todayKey={todayKey}
        dailyChallengeConfig={dailyChallengeConfig}
        isCompletedToday={isCompletedToday}
        todayResult={todayResult}
        dailyStreak={dailyStreak}
        isDailyChallengeActive={isDailyChallengeActive}
        isPracticeReplay={isPracticeReplay}
        onStartDailyChallenge={startDailyChallenge}
        onStartPracticeReplay={startPracticeReplay}
        onExitDailyChallenge={exitDailyChallenge}
      />

      <div className="divider" />

      <ModeSelector
        activeMode={gameMode}
        onSelectMode={changeGameMode}
        disabled={isDailyChallengeActive}
      />

      <div className="divider" />

      <DifficultySelector
        activeDifficulty={difficulty}
        onSelectDifficulty={changeDifficulty}
        disabled={isDailyChallengeActive}
      />

      <StreakDisplay
        currentStreak={streak.currentStreak}
        bestStreak={streak.bestStreak}
      />

      <TimerDisplay
        timeRemaining={timeRemaining}
        isTimedMode={gameMode === 'timed'}
      />

      <AttemptsRemainingDisplay
        attempts={attempts}
        maxAttempts={config.maxAttempts}
        isLimitedMode={gameMode === 'limited'}
      />

      <div className="divider" />

      <SecretNumberDisplay
        status={status}
        secretNumber={secretNumber}
      />

      <GameStatusMessage
        message={message}
        maxNumber={config.maxNumber}
      />

      <ProximityIndicator
        proximity={proximity}
      />

      <HintControls
        currentHint={currentHint}
        hintCost={hintCost}
        hintsUsed={hintsUsed}
        onGetHint={getHint}
        disabled={isGameOver}
        canAffordHint={canAffordHint}
      />

      <GuessForm
        guessInput={guessInput}
        onGuessChange={setGuessInput}
        onSubmitGuess={handleGuessSubmit}
        disabled={isGameOver}
        isInvalid={isInvalid}
        resetToken={resetToken}
      />

      <div className="divider" />

      <ScoreBoard
        score={score}
        highScore={highScore}
        attempts={attempts}
      />

      <RoundSummary
        status={status}
        difficultyName={config.name}
        gameMode={gameMode}
        score={score}
        attempts={attempts}
        secretNumber={secretNumber}
        timeRemaining={timeRemaining}
        hintsUsed={hintsUsed}
        unlockedThisRound={unlockedThisRound}
        maxAttempts={config.maxAttempts}
        isDailyChallengeActive={isDailyChallengeActive}
        isPracticeReplay={isPracticeReplay}
        todayKey={todayKey}
      />

      <GuessHistory
        history={guessHistory}
      />

      <ActionControls
        onResetGame={resetGame}
      />

      <div className="divider" />

      <GameStatistics
        statistics={statistics}
        streak={streak}
        bestAttempts={bestAttempts}
        onResetStatistics={resetStatistics}
      />

      <div className="divider" />

      <PersonalRecords
        statistics={statistics}
        streak={streak}
        bestAttempts={bestAttempts}
        achievements={achievements}
        dailyStreak={dailyStreak}
        history={gameHistory}
      />

      <div className="divider" />

      <CompletedGameHistory
        history={gameHistory}
        activeProfileName={activeProfile ? activeProfile.name : 'Active Player'}
        onClearHistory={clearGameHistory}
      />

      <div className="divider" />

      <ProfileSummary
        activeProfile={activeProfile}
        statistics={statistics}
        streak={streak}
        bestAttempts={bestAttempts}
        achievements={achievements}
        dailyStreak={dailyStreak}
      />

      <div className="divider" />

      <LocalLeaderboard
        profiles={profiles}
        activeProfileId={activeProfileId}
      />

      <div className="divider" />

      <ProgressBackupControls
        onExportBackup={() => triggerExport(soundEnabled)}
        onRestoreBackup={restoreBackup}
      />

      <div className="divider" />

      <Achievements
        unlockedAchievements={achievements}
      />
    </main>
  );
}

export default App;
