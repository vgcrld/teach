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
    checkAnswer,
  } = useGameLogic();

  return (
    <div className="app" style={{ position: 'relative' }}>
      <ScoreBoard score={score} streak={streak} feedback={feedback} />
      <header className="app-header">
        <h1>Grand Staff Training</h1>
        <p className="instructions">
          Find the note on the staff! Click a piano key or type A–G on your keyboard.
        </p>
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
          />
        </section>
      </main>
    </div>
  );
}

export default App;
