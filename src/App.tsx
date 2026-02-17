import { useState } from 'react';
import { StaffScroller } from './components/StaffScroller';
import { PianoKeyboard } from './components/PianoKeyboard';
import { ScoreBoard } from './components/ScoreBoard';
import { useGameLogic } from './hooks/useGameLogic';
import './App.css';

function App() {
  const [isPlayMode, setIsPlayMode] = useState(false);
  const {
    notes,
    score,
    streak,
    feedback,
    feedbackKey,
    keyboardOctave,
    onKeyPress,
    startOver,
  } = useGameLogic(isPlayMode);

  return (
    <div className="app" style={{ position: 'relative' }}>
      {!isPlayMode && (
        <ScoreBoard score={score} streak={streak} feedback={feedback} />
      )}
      <header className="app-header">
        <h1>Grand Staff Training</h1>
        <div className="header-controls">
          <label className="mode-toggle" htmlFor="play-mode-toggle">
            <span className="mode-label">Play</span>
            <button
              id="play-mode-toggle"
              type="button"
              role="switch"
              aria-checked={isPlayMode}
              aria-label="Toggle play mode"
              className={`toggle-switch ${isPlayMode ? 'on' : ''}`}
              onClick={() => setIsPlayMode((v) => !v)}
            >
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
            </button>
          </label>
          <button type="button" className="start-over-btn" onClick={startOver}>
            {isPlayMode ? 'Clear' : 'Start Over'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="staff-section" aria-label="Music staff with notes">
          <StaffScroller notes={notes} />
        </section>

        <section className="piano-section" aria-label="Piano keyboard">
          <PianoKeyboard
            onKeyPress={onKeyPress}
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
