import { useState, useEffect } from 'react';
import { playNote } from '../utils/audio';
import './PianoKeyboard.css';

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'] as const;

// keyId -> computer key label (same keys for all 3 octaves; shift cycles which octave)
const KEY_ID_TO_PC_KEY: Record<string, string> = {
  C3: 'a', D3: 's', E3: 'd', F3: 'f', G3: 'g', A3: 'h', B3: 'j',
  C4: 'a', D4: 's', E4: 'd', F4: 'f', G4: 'g', A4: 'h', B4: 'j',
  C5: 'a', D5: 's', E5: 'd', F5: 'f',
  'C#3': 'w', 'D#3': 'e', 'F#3': 'r', 'G#3': 't', 'A#3': 'y',
  'C#4': 'w', 'D#4': 'e', 'F#4': 'r', 'G#4': 't', 'A#4': 'y',
  'C#5': 'w', 'D#5': 'e',
};
const BLACK_KEY_POS_IN_OCTAVE = [0, 1, 3, 4, 5] as const; // 1/7, 2/7, 4/7, 5/7, 6/7 of octave width

// Octave 3: 7 keys, Octave 4: 7 keys, Octave 5: 4 keys
const OCTAVE_CONFIG = [
  { octave: 3, keys: [...WHITE_KEYS] },
  { octave: 4, keys: [...WHITE_KEYS] },
  { octave: 5, keys: ['C', 'D', 'E', 'F'] as const },
];

interface PianoKeyboardProps {
  onKeyPress: (noteName: string, keyId?: string) => void;
  feedbackKey: string | null;
  feedbackType: 'correct' | 'wrong' | null;
  activeOctave: 3 | 4 | 5;
}

export function PianoKeyboard({ onKeyPress, feedbackKey, feedbackType, activeOctave }: PianoKeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?') {
        e.preventDefault();
        setShowLabels((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleWhiteKeyClick = (noteName: string, fullName: string, octave: number) => {
    setPressedKey(fullName);
    playNote(noteName, octave);
    onKeyPress(noteName, fullName);
    setTimeout(() => setPressedKey(null), 150);
  };

  const handleBlackKeyClick = (baseNote: string, octave: number) => {
    const keyId = `${baseNote}${octave}`;
    setPressedKey(keyId);
    playNote(baseNote, octave);
    onKeyPress(baseNote, keyId);
    setTimeout(() => setPressedKey(null), 150);
  };

  const getKeyFeedback = (keyId: string) => {
    if (!feedbackKey || keyId !== feedbackKey) return null;
    return feedbackType;
  };

  return (
    <div className="piano-keyboard" role="group" aria-label="Piano keyboard">
      <div className="piano-inner">
        {OCTAVE_CONFIG.map(({ octave, keys }) => (
          <div key={octave} className={`piano-octave ${keys.length === 4 ? 'short' : ''}`}>
            <div className="white-key-row">
              {keys.map((name) => {
                const fullName = `${name}${octave}`;
                const pcKey = KEY_ID_TO_PC_KEY[fullName];
                return (
                  <button
                    key={fullName}
                    type="button"
                    className={`piano-key white ${pressedKey === fullName ? 'pressed' : ''} ${
                      getKeyFeedback(fullName) === 'correct' ? 'correct' : ''
                    } ${getKeyFeedback(fullName) === 'wrong' ? 'wrong' : ''}`}
                    onClick={() => handleWhiteKeyClick(name, fullName, octave)}
                    aria-label={`Key ${name}`}
                  >
                    {showLabels && pcKey && octave === activeOctave && <span className="piano-key-label">{pcKey}</span>}
                  </button>
                );
              })}
            </div>
            <div className="black-key-row">
              {(keys.length === 7 ? BLACK_KEYS : ['C#', 'D#']).map((keyName, i) => {
                const keyCount = keys.length;
                const boundaryNum = keyCount === 7 ? BLACK_KEY_POS_IN_OCTAVE[i] + 1 : i + 1;
                const denominator = keyCount;
                const fullName = `${keyName}${octave}`;
                const pcKey = KEY_ID_TO_PC_KEY[fullName];
                return (
                  <button
                    key={fullName}
                    type="button"
                    className={`piano-key black ${pressedKey === fullName ? 'pressed' : ''} ${
                      getKeyFeedback(fullName) === 'correct' ? 'correct' : ''
                    } ${getKeyFeedback(fullName) === 'wrong' ? 'wrong' : ''}`}
                    style={{
                      left: `calc(${boundaryNum}/${denominator} * 100% - 11px)`,
                    }}
                    onClick={() => handleBlackKeyClick(keyName, octave)}
                    aria-label={`Key ${keyName}`}
                  >
                    {showLabels && pcKey && octave === activeOctave && <span className="piano-key-label">{pcKey}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
