import React, { useState, useEffect } from 'react';
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
import { GameStatistics } from './components/GameStatistics';
import { useGameState } from './hooks/useGameState';
import { useSoundEffects } from './hooks/useSoundEffects';
import { APP_VERSION } from './constants/version';

export function App() {
  const [activeTab, setActiveTab] = useState('PLAY');

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

      <nav className="terminal-nav" aria-label="Main Navigation">
        <div className="tab-list" role="tablist">
          <button
            id="tab-play"
            type="button"
            role="tab"
            aria-selected={activeTab === 'PLAY'}
            aria-controls="panel-play"
            className={`nav-tab ${activeTab === 'PLAY' ? 'active' : ''}`}
            onClick={() => setActiveTab('PLAY')}
          >
            🎮 PLAY
          </button>
          <button
            id="tab-stats"
            type="button"
            role="tab"
            aria-selected={activeTab === 'STATS'}
            aria-controls="panel-stats"
            className={`nav-tab ${activeTab === 'STATS' ? 'active' : ''}`}
            onClick={() => setActiveTab('STATS')}
          >
            📊 STATS
          </button>
          <button
            id="tab-history"
            type="button"
            role="tab"
            aria-selected={activeTab === 'HISTORY'}
            aria-controls="panel-history"
            className={`nav-tab ${activeTab === 'HISTORY' ? 'active' : ''}`}
            onClick={() => setActiveTab('HISTORY')}
          >
            📜 HISTORY
          </button>
          <button
            id="tab-players"
            type="button"
            role="tab"
            aria-selected={activeTab === 'PLAYERS'}
            aria-controls="panel-players"
            className={`nav-tab ${activeTab === 'PLAYERS' ? 'active' : ''}`}
            onClick={() => setActiveTab('PLAYERS')}
          >
            👤 PLAYERS
          </button>
          <button
            id="tab-settings"
            type="button"
            role="tab"
            aria-selected={activeTab === 'SETTINGS'}
            aria-controls="panel-settings"
            className={`nav-tab ${activeTab === 'SETTINGS' ? 'active' : ''}`}
            onClick={() => setActiveTab('SETTINGS')}
          >
            ⚙️ SETTINGS
          </button>
        </div>
        <div className="active-player-pill" title="Active Player">
          👤 <span className="player-name">{activeProfile ? activeProfile.name : 'Player'}</span>
        </div>
      </nav>

      {/* PLAY TAB PANEL */}
      <div
        id="panel-play"
        role="tabpanel"
        aria-labelledby="tab-play"
        hidden={activeTab !== 'PLAY'}
        className="tab-panel"
      >
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
      </div>

      {/* STATS TAB PANEL */}
      <div
        id="panel-stats"
        role="tabpanel"
        aria-labelledby="tab-stats"
        hidden={activeTab !== 'STATS'}
        className="tab-panel"
      >
        <ProfileSummary
          activeProfile={activeProfile}
          statistics={statistics}
          streak={streak}
          bestAttempts={bestAttempts}
          achievements={achievements}
          dailyStreak={dailyStreak}
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

        <Achievements
          unlockedAchievements={achievements}
        />
      </div>

      {/* HISTORY TAB PANEL */}
      <div
        id="panel-history"
        role="tabpanel"
        aria-labelledby="tab-history"
        hidden={activeTab !== 'HISTORY'}
        className="tab-panel"
      >
        <CompletedGameHistory
          history={gameHistory}
          activeProfileName={activeProfile ? activeProfile.name : 'Active Player'}
          onClearHistory={clearGameHistory}
        />
      </div>

      {/* PLAYERS TAB PANEL */}
      <div
        id="panel-players"
        role="tabpanel"
        aria-labelledby="tab-players"
        hidden={activeTab !== 'PLAYERS'}
        className="tab-panel"
      >
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

        <LocalLeaderboard
          profiles={profiles}
          activeProfileId={activeProfileId}
        />
      </div>

      {/* SETTINGS TAB PANEL */}
      <div
        id="panel-settings"
        role="tabpanel"
        aria-labelledby="tab-settings"
        hidden={activeTab !== 'SETTINGS'}
        className="tab-panel"
      >
        <div className="settings-section">
          <h3>⚙️ APPLICATION SETTINGS</h3>

          <div className="sound-toggle-bar">
            <button
              type="button"
              className={`btn-sound ${soundEnabled ? 'active' : ''}`}
              aria-pressed={soundEnabled}
              onClick={toggleSound}
            >
              🔊 Sound Effects: {soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className="divider" />

        <ProgressBackupControls
          onExportBackup={() => triggerExport(soundEnabled)}
          onRestoreBackup={restoreBackup}
        />

        <div className="divider" />

        <div className="about-section retro-card">
          <h4>ℹ️ ABOUT & RELEASE INFO</h4>
          <p className="version-info">
            <strong>Guess My Number</strong> — Version <span className="version-tag">v{APP_VERSION}</span>
          </p>
          <p className="privacy-notice">
            🔒 <strong>Data Privacy:</strong> All game data, profiles, and statistics are stored locally in your browser's local storage. No data is collected or sent to external servers.
          </p>
        </div>
      </div>
    </main>
  );
}

export default App;
