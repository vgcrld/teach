import { useState, useEffect, useCallback, useRef } from 'react';
import { playNoteForLetter } from '../utils/audio';
import { getRandomNote, type Note } from '../utils/notes';

const CORRECT_DELAY_MS = 800;

export type FeedbackType = 'correct' | 'wrong' | null;

export type StaffNote = { note: Note; answered: boolean };

export function useGameLogic() {
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [feedbackKey, setFeedbackKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentNote = notes.length > 0 && !notes[notes.length - 1].answered
    ? notes[notes.length - 1].note
    : null;

  const pickNewNote = useCallback(() => {
    setNotes((prev) => [...prev, { note: getRandomNote(), answered: false }]);
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
      if (!keyId) playNoteForLetter(normalizedAnswer);
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentNote || e.repeat) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(key)) {
        e.preventDefault();
        checkAnswer(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentNote, checkAnswer]);

  return {
    notes,
    currentNote,
    score,
    streak,
    feedback,
    feedbackKey,
    checkAnswer,
  };
}
