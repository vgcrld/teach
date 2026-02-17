import { useState } from 'react';
import { playNote } from '../utils/audio';
import './PianoKeyboard.css';

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'] as const;
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
}

export function PianoKeyboard({ onKeyPress, feedbackKey, feedbackType }: PianoKeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

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
    onKeyPress(baseNote.replace('#', ''), keyId);
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
              {keys.map((name) => (
                <button
                  key={`${name}${octave}`}
                  type="button"
                  className={`piano-key white ${pressedKey === `${name}${octave}` ? 'pressed' : ''} ${
                    getKeyFeedback(`${name}${octave}`) === 'correct' ? 'correct' : ''
                  } ${getKeyFeedback(`${name}${octave}`) === 'wrong' ? 'wrong' : ''}`}
                  onClick={() => handleWhiteKeyClick(name, `${name}${octave}`, octave)}
                  aria-label={`Key ${name}`}
                />
              ))}
            </div>
            <div className="black-key-row">
              {(keys.length === 7 ? BLACK_KEYS : ['C#', 'D#']).map((keyName, i) => {
                const keyCount = keys.length;
                const boundaryNum = keyCount === 7 ? BLACK_KEY_POS_IN_OCTAVE[i] + 1 : i + 1;
                const denominator = keyCount;
                return (
                  <button
                    key={`${keyName}${octave}`}
                    type="button"
                    className={`piano-key black ${pressedKey === `${keyName}${octave}` ? 'pressed' : ''} ${
                      getKeyFeedback(`${keyName}${octave}`) === 'correct' ? 'correct' : ''
                    } ${getKeyFeedback(`${keyName}${octave}`) === 'wrong' ? 'wrong' : ''}`}
                    style={{
                      left: `calc(${boundaryNum}/${denominator} * 100% - 11px)`,
                    }}
                    onClick={() => handleBlackKeyClick(keyName, octave)}
                    aria-label={`Key ${keyName}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
