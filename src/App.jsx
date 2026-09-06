import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { DifficultySelector } from './components/DifficultySelector';
import { SecretNumberDisplay } from './components/SecretNumberDisplay';
import { GameStatusMessage } from './components/GameStatusMessage';
import { ProximityIndicator } from './components/ProximityIndicator';
import { GuessForm } from './components/GuessForm';
import { ScoreBoard } from './components/ScoreBoard';
import { GuessHistory } from './components/GuessHistory';
import { ActionControls } from './components/ActionControls';
import { useGameState } from './hooks/useGameState';

export function App() {
  const {
    difficulty,
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
    changeDifficulty,
    makeGuess,
    resetGame,
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

      <div className="divider" />

      <DifficultySelector
        activeDifficulty={difficulty}
        onSelectDifficulty={changeDifficulty}
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

      <GuessHistory
        history={guessHistory}
      />

      <ActionControls
        onResetGame={resetGame}
      />
    </main>
  );
}

export default App;
