import { useState, useEffect, useCallback, useRef } from 'react';
import { playNote } from '../utils/audio';
import { getRandomNotes, noteFromPiano, type Note } from '../utils/notes';

const CORRECT_DELAY_MS = 800;
const INITIAL_NOTE_COUNT = 12; // enough to fill the staff

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

const MAX_PLAY_NOTES = 32;

export function useGameLogic(isPlayMode: boolean) {
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [playedNotes, setPlayedNotes] = useState<StaffNote[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [feedbackKey, setFeedbackKey] = useState<string | null>(null);
  const [keyboardOctave, setKeyboardOctave] = useState<3 | 4 | 5>(3); // shift cycles 3→4→5→3
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstUnansweredIndex = notes.findIndex((n) => !n.answered);
  const currentNote =
    firstUnansweredIndex >= 0 ? notes[firstUnansweredIndex].note : null;

  // Sync keyboard octave to current note so staff and piano align (game mode only)
  useEffect(() => {
    if (!isPlayMode && currentNote && currentNote.octave >= 3 && currentNote.octave <= 5) {
      setKeyboardOctave(currentNote.octave as 3 | 4 | 5);
    }
  }, [isPlayMode, currentNote]);

  // Reset state when switching modes
  useEffect(() => {
    if (isPlayMode) {
      setPlayedNotes([]);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setFeedback(null);
      setFeedbackKey(null);
    } else {
      setNotes(
        getRandomNotes(INITIAL_NOTE_COUNT).map((note) => ({ note, answered: false }))
      );
      setScore(0);
      setStreak(0);
      setFeedback(null);
      setFeedbackKey(null);
    }
  }, [isPlayMode]);

  const addPlayedNote = useCallback((noteName: string, keyId?: string) => {
    if (!keyId) return;
    const octave = parseInt(keyId.slice(-1), 10);
    if (isNaN(octave) || octave < 3 || octave > 5) return;
    const note = noteFromPiano(noteName, octave);
    if (note) {
      setPlayedNotes((prev) => {
        const next = [...prev, { note, answered: true }];
        return next.length > MAX_PLAY_NOTES ? next.slice(-MAX_PLAY_NOTES) : next;
      });
    }
  }, []);

  const appendNote = useCallback(() => {
    setNotes((prev) => {
      const next = [...prev, { note: getRandomNotes(1)[0], answered: false }];
      // Trim from left to cap at ~24 notes
      if (next.length > 24) return next.slice(next.length - 24);
      return next;
    });
    setFeedback(null);
    setFeedbackKey(null);
  }, []);

  const startOver = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isPlayMode) {
      setPlayedNotes([]);
      setFeedback(null);
      setFeedbackKey(null);
    } else {
      setNotes(
        getRandomNotes(INITIAL_NOTE_COUNT).map((note) => ({ note, answered: false }))
      );
      setScore(0);
      setStreak(0);
      setFeedback(null);
      setFeedbackKey(null);
    }
  }, [isPlayMode]);

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
          const idx = next.findIndex((n) => !n.answered);
          if (idx >= 0) next[idx] = { ...next[idx], answered: true };
          return next;
        });

        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          appendNote();
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
    [currentNote, appendNote]
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
      if (e.repeat) return;
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
        if (isPlayMode) {
          addPlayedNote(mapped.noteName, keyId);
        } else {
          if (!currentNote) return;
          checkAnswer(mapped.noteName, keyId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlayMode, currentNote, checkAnswer, addPlayedNote, keyboardOctave]);

  const displayNotes = isPlayMode ? playedNotes : notes;
  const onKeyPress = isPlayMode ? addPlayedNote : checkAnswer;

  return {
    notes: displayNotes,
    currentNote,
    score,
    streak,
    feedback: isPlayMode ? null : feedback,
    feedbackKey: isPlayMode ? null : feedbackKey,
    keyboardOctave,
    onKeyPress,
    startOver,
    isPlayMode,
  };
}
