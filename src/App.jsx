import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from './components/DifficultySelector';
import { SecretNumberDisplay } from './components/SecretNumberDisplay';
import { GameStatusMessage } from './components/GameStatusMessage';
import { ProximityIndicator } from './components/ProximityIndicator';
import { StreakDisplay } from './components/StreakDisplay';
import { TimerDisplay } from './components/TimerDisplay';
import { HintControls } from './components/HintControls';
import { GuessForm } from './components/GuessForm';
import { ScoreBoard } from './components/ScoreBoard';
import { RoundSummary } from './components/RoundSummary';
import { GuessHistory } from './components/GuessHistory';
import { ActionControls } from './components/ActionControls';
import { GameStatistics } from './components/GameStatistics';
import { Achievements } from './components/Achievements';
import { AchievementToast } from './components/AchievementToast';
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
    changeDifficulty,
    changeGameMode,
    makeGuess,
    getHint,
    resetGame,
    resetStatistics,
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

      <ModeSelector
        activeMode={gameMode}
        onSelectMode={changeGameMode}
      />

      <div className="divider" />

      <DifficultySelector
        activeDifficulty={difficulty}
        onSelectDifficulty={changeDifficulty}
      />

      <StreakDisplay
        currentStreak={streak.currentStreak}
        bestStreak={streak.bestStreak}
      />

      <TimerDisplay
        timeRemaining={timeRemaining}
        isTimedMode={gameMode === 'timed'}
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

      <Achievements
        unlockedAchievements={achievements}
      />
    </main>
  );
}

export default App;
