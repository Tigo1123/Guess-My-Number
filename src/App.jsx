import React, { useState, useEffect, useRef } from 'react';
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
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { useGameState } from './hooks/useGameState';
import { useSoundEffects } from './hooks/useSoundEffects';
import { APP_VERSION } from './constants/version';
import { usePwaStatus } from './hooks/usePwaStatus';
import { PwaStatusNotice } from './components/PwaStatusNotice';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { InstallAppControl } from './components/InstallAppControl';
import { ThemeControls } from './components/ThemeControls';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';
import { KeyboardShortcutsSettings } from './components/KeyboardShortcutsSettings';

export function App() {
  const [activeTab, setActiveTab] = useState('PLAY');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { canInstall, install, isOffline, showBackOnline } = usePwaStatus();
  const { themePreference, accent, chooseTheme, chooseAccent } = useTheme();

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
    initAudioOnUserGesture,
    playCorrect,
    playWrong,
    playAchievement,
    playTimeWarning,
    playHint,
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

  const prevAttemptsRef = useRef(attempts);
  useEffect(() => {
    if (attempts > prevAttemptsRef.current && status === 'PLAYING') {
      playWrong();
    }
    prevAttemptsRef.current = attempts;
  }, [attempts, status, playWrong]);

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
    initAudioOnUserGesture();
    makeGuess(rawGuess);
  };

  const handleGetHint = () => {
    initAudioOnUserGesture();
    getHint();
    playHint();
  };

  useKeyboardShortcuts({
    onSubmitGuess: () => { if (!isGameOver && guessInput.trim()) handleGuessSubmit(guessInput); },
    onNewRound: () => resetGame(),
    onHint: () => { if (!isGameOver && canAffordHint) handleGetHint(); },
    onNavigate: (key) => setActiveTab({ 1: 'PLAY', 2: 'STATS', 3: 'HISTORY', 4: 'PLAYERS', 5: 'SETTINGS' }[key]),
    onOpenHelp: () => setShortcutsOpen(true),
    onCloseHelp: () => setShortcutsOpen(false),
    helpOpen: shortcutsOpen,
  });

  return (
    <main className="terminal">
      <PwaStatusNotice isOffline={isOffline} showBackOnline={showBackOnline} />
      <PwaUpdatePrompt />
      <KeyboardShortcutsPanel open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <AchievementToast toastMessage={toastMessage} />

      <Header />

      <nav className="app-nav" aria-label="Main Navigation">
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
            Play
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
            Stats
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
            History
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
            Players
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
            Settings
          </button>
        </div>
        <div className="active-player-pill" title="Active Player">
          <span className="avatar-circle">
            {activeProfile && activeProfile.name ? activeProfile.name.charAt(0).toUpperCase() : 'P'}
          </span>
          <span className="player-name">{activeProfile ? activeProfile.name : 'Player'}</span>
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
        <div className="play-layout-grid">
          {/* LEFT MAIN GAME COLUMN (~65%) */}
          <div className="game-board-column">
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

            <GuessForm
              guessInput={guessInput}
              onGuessChange={setGuessInput}
              onSubmitGuess={handleGuessSubmit}
              disabled={isGameOver}
              isInvalid={isInvalid}
              resetToken={resetToken}
            />

            <DifficultySelector
              activeDifficulty={difficulty}
              onSelectDifficulty={changeDifficulty}
              disabled={isDailyChallengeActive}
            />

            <ModeSelector
              activeMode={gameMode}
              onSelectMode={changeGameMode}
              disabled={isDailyChallengeActive}
            />

            <div className="game-actions-bar">
              <HintControls
                currentHint={currentHint}
                hintCost={hintCost}
                hintsUsed={hintsUsed}
                onGetHint={handleGetHint}
                disabled={isGameOver}
                canAffordHint={canAffordHint}
              />
              <ActionControls
                onResetGame={resetGame}
              />
            </div>

            <RoundSummary
              streak={streak.currentStreak}
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
          </div>

          {/* RIGHT SIDEBAR COLUMN (~35%) */}
          <div className="sidebar-column">
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

            <div className="metrics-card-container">
              <h3 className="metrics-header-title">Current Game Stats</h3>
              <ScoreBoard
                score={score}
                highScore={highScore}
                attempts={attempts}
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
            </div>
          </div>
        </div>
      </div>

      {/* STATS TAB PANEL */}
      <div
        id="panel-stats"
        role="tabpanel"
        aria-labelledby="tab-stats"
        hidden={activeTab !== 'STATS'}
        className="tab-panel stats-tab-container"
      >
        <ProfileSummary
          activeProfile={activeProfile}
          statistics={statistics}
          streak={streak}
          bestAttempts={bestAttempts}
          achievements={achievements}
          dailyStreak={dailyStreak}
        />

        <GameStatistics
          statistics={statistics}
          streak={streak}
          bestAttempts={bestAttempts}
          onResetStatistics={resetStatistics}
        />

        <AdvancedAnalytics history={gameHistory} />

        <PersonalRecords
          statistics={statistics}
          streak={streak}
          bestAttempts={bestAttempts}
          achievements={achievements}
          dailyStreak={dailyStreak}
          history={gameHistory}
        />

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
          onPlayRound={() => setActiveTab('PLAY')}
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
        className="tab-panel settings-tab-container"
      >
        <div className="settings-cards-stack">
          {/* 12. PREFERENCES */}
          <section className="summary-card-block" aria-label="Game Preferences">
            <h2 className="section-title">Preferences</h2>
            <div className="preference-setting-row">
              <div className="setting-info">
                <span className="setting-label-title">Sound effects</span>
                <p className="setting-desc-text">Play feedback sounds during the game.</p>
              </div>
              <button
                type="button"
                className={`btn-sound-toggle ${soundEnabled ? 'on' : 'off'}`}
                aria-pressed={soundEnabled}
                onClick={toggleSound}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </section>

          <ThemeControls
            themePreference={themePreference}
            accent={accent}
            onThemeChange={chooseTheme}
            onAccentChange={chooseAccent}
          />

          <KeyboardShortcutsSettings onOpen={() => setShortcutsOpen(true)} />

          <section className="summary-card-block" aria-label="Install Application">
            <h2 className="section-title">App</h2>
            <InstallAppControl canInstall={canInstall} onInstall={install} />
          </section>

          {/* 11. BACKUP & RESTORE */}
          <ProgressBackupControls
            onExportBackup={() => triggerExport(soundEnabled)}
            onRestoreBackup={restoreBackup}
          />

          {/* 13. RESET STATISTICS (DANGER ZONE) */}
          <section className="summary-card-block" aria-label="Reset Statistics">
            <h2 className="section-title">Reset statistics</h2>
            <p className="setting-desc-text">
              Clear statistics for the active player while preserving the profile.
            </p>
            <div className="card-action-footer">
              <button
                type="button"
                className="btn-danger"
                onClick={resetStatistics}
              >
                Reset statistics
              </button>
            </div>
          </section>

          {/* 14. ABOUT */}
          <section className="summary-card-block about-card" aria-label="About Application">
            <h2 className="section-title">About</h2>
            <div className="about-details">
              <h3 className="about-app-name">Guess My Number</h3>
              <span className="about-version-badge">Version v{APP_VERSION}</span>
              <p className="about-storage-text">
                Data Privacy: Your profiles and game progress are stored locally in this browser.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
