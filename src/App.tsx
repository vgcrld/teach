import { GrandStaff } from './components/GrandStaff';
import { PianoKeyboard } from './components/PianoKeyboard';
import { ScoreBoard } from './components/ScoreBoard';
import { useGameLogic } from './hooks/useGameLogic';
import './App.css';

function App() {
  const {
    notes,
    score,
    streak,
    feedback,
    feedbackKey,
    keyboardOctave,
    checkAnswer,
    startOver,
  } = useGameLogic();

  return (
    <div className="app" style={{ position: 'relative' }}>
      <ScoreBoard score={score} streak={streak} feedback={feedback} />
      <header className="app-header">
        <h1>Grand Staff Training</h1>
        <p className="instructions">
          Find the note on the staff! Click a piano key or use keyboard: asdfghj (white), werty (black). Press <kbd>Shift</kbd> to cycle octave <span className="octave-badge" aria-live="polite">{keyboardOctave === 3 ? '3' : keyboardOctave === 4 ? '4' : '5'}</span>. Press ? to toggle key labels. Includes naturals and sharps (♯).
        </p>
        <button type="button" className="start-over-btn" onClick={startOver}>
          Start Over
        </button>
      </header>

      <main className="app-main">
        <section className="staff-section" aria-label="Music staff with note">
          <GrandStaff notes={notes} />
        </section>

        <section className="piano-section" aria-label="Piano keyboard">
          <PianoKeyboard
            onKeyPress={checkAnswer}
            feedbackKey={feedbackKey}
            feedbackType={feedback}
            activeOctave={keyboardOctave}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
