import { useState, useEffect, useCallback, useRef } from 'react';
import { playNote } from '../utils/audio';
import { getRandomNote, type Note } from '../utils/notes';

const CORRECT_DELAY_MS = 800;

// Base key -> note (octave comes from shift-toggle state)
const WHITE_KEYS: Record<string, { noteName: string; note: string }> = {
  a: { noteName: 'C', note: 'C' }, s: { noteName: 'D', note: 'D' }, d: { noteName: 'E', note: 'E' },
  f: { noteName: 'F', note: 'F' }, g: { noteName: 'G', note: 'G' }, h: { noteName: 'A', note: 'A' },
  j: { noteName: 'B', note: 'B' },
};
const BLACK_KEYS: Record<string, { noteName: string; note: string }> = {
  w: { noteName: 'C#', note: 'C#' }, e: { noteName: 'D#', note: 'D#' }, r: { noteName: 'F#', note: 'F#' },
  t: { noteName: 'G#', note: 'G#' }, y: { noteName: 'A#', note: 'A#' },
};

export type FeedbackType = 'correct' | 'wrong' | null;

export type StaffNote = { note: Note; answered: boolean };

export function useGameLogic() {
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [feedbackKey, setFeedbackKey] = useState<string | null>(null);
  const [keyboardOctave, setKeyboardOctave] = useState<3 | 4 | 5>(3); // shift cycles 3→4→5→3
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentNote = notes.length > 0 && !notes[notes.length - 1].answered
    ? notes[notes.length - 1].note
    : null;

  const pickNewNote = useCallback(() => {
    setNotes((prev) => [...prev, { note: getRandomNote(), answered: false }]);
    setFeedback(null);
    setFeedbackKey(null);
  }, []);

  const startOver = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setNotes([{ note: getRandomNote(), answered: false }]);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setFeedbackKey(null);
  }, []);

  useEffect(() => {
    setNotes([{ note: getRandomNote(), answered: false }]);
  }, []);

  const checkAnswer = useCallback(
    (noteName: string, keyId?: string) => {
      if (!currentNote) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const normalizedAnswer = noteName.toUpperCase().trim();
      const isCorrect = normalizedAnswer === currentNote.name.toUpperCase();

      // keyId = specific key pressed (e.g. "C4", "C#3"). From keyboard, derive from current note octave.
      const feedbackKeyId = keyId ?? `${normalizedAnswer}${currentNote.octave}`;

      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        setFeedback('correct');
        setFeedbackKey(feedbackKeyId);
        setNotes((prev) => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], answered: true };
          return next;
        });

        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          pickNewNote();
        }, CORRECT_DELAY_MS);
      } else {
        setStreak(0);
        setFeedback('wrong');
        setFeedbackKey(feedbackKeyId);

        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          setFeedback(null);
          setFeedbackKey(null);
        }, 600);
      }
    },
    [currentNote, pickNewNote]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setKeyboardOctave((v) => (v === 3 ? 4 : v === 4 ? 5 : 3));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentNote || e.repeat) return;
      if (e.key === 'Shift') return; // shift is for toggle only

      const baseKey = e.key.toLowerCase();
      const octave = keyboardOctave;
      const white = WHITE_KEYS[baseKey];
      const black = BLACK_KEYS[baseKey];
      const mapped = white ?? black;
      if (mapped) {
        e.preventDefault();
        const keyId = `${mapped.noteName}${octave}`;
        playNote(mapped.note, octave);
        checkAnswer(mapped.noteName, keyId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentNote, checkAnswer, keyboardOctave]);

  return {
    notes,
    currentNote,
    score,
    streak,
    feedback,
    feedbackKey,
    keyboardOctave,
    checkAnswer,
    startOver,
  };
}
