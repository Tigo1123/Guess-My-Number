import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { DifficultySelector } from './components/DifficultySelector';
import { SecretNumberDisplay } from './components/SecretNumberDisplay';
import { GameStatusMessage } from './components/GameStatusMessage';
import { ProximityIndicator } from './components/ProximityIndicator';
import { StreakDisplay } from './components/StreakDisplay';
import { TimerDisplay } from './components/TimerDisplay';
import { GuessForm } from './components/GuessForm';
import { ScoreBoard } from './components/ScoreBoard';
import { RoundSummary } from './components/RoundSummary';
import { GuessHistory } from './components/GuessHistory';
import { ActionControls } from './components/ActionControls';
import { GameStatistics } from './components/GameStatistics';
import { useGameState } from './hooks/useGameState';

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
    timeRemaining,
    changeDifficulty,
    changeGameMode,
    makeGuess,
    resetGame,
    resetStatistics,
  } = useGameState();

  const isGameOver = status !== 'PLAYING';

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

  return (
    <main className="terminal">
      <Header />

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

      <GuessForm
        guessInput={guessInput}
        onGuessChange={setGuessInput}
        onSubmitGuess={makeGuess}
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
    </main>
  );
}

export default App;
