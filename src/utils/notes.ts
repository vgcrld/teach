export type Clef = 'treble' | 'bass';

export interface Note {
  name: string;
  octave: number;
  staffPosition: number;
  clef: Clef;
}

// Treble clef: naturals and sharps, C4 through A5
const TREBLE_NOTES: Note[] = [
  { name: 'C', octave: 4, staffPosition: -2, clef: 'treble' },
  { name: 'C#', octave: 4, staffPosition: -2, clef: 'treble' },
  { name: 'D', octave: 4, staffPosition: -1, clef: 'treble' },
  { name: 'D#', octave: 4, staffPosition: -1, clef: 'treble' },
  { name: 'E', octave: 4, staffPosition: 0, clef: 'treble' },
  { name: 'F', octave: 4, staffPosition: 1, clef: 'treble' },
  { name: 'F#', octave: 4, staffPosition: 1, clef: 'treble' },
  { name: 'G', octave: 4, staffPosition: 2, clef: 'treble' },
  { name: 'G#', octave: 4, staffPosition: 2, clef: 'treble' },
  { name: 'A', octave: 4, staffPosition: 3, clef: 'treble' },
  { name: 'A#', octave: 4, staffPosition: 3, clef: 'treble' },
  { name: 'B', octave: 4, staffPosition: 4, clef: 'treble' },
  { name: 'C', octave: 5, staffPosition: 5, clef: 'treble' },
  { name: 'C#', octave: 5, staffPosition: 5, clef: 'treble' },
  { name: 'D', octave: 5, staffPosition: 6, clef: 'treble' },
  { name: 'D#', octave: 5, staffPosition: 6, clef: 'treble' },
  { name: 'E', octave: 5, staffPosition: 7, clef: 'treble' },
  { name: 'F', octave: 5, staffPosition: 8, clef: 'treble' },
  { name: 'F#', octave: 5, staffPosition: 8, clef: 'treble' },
  { name: 'G', octave: 5, staffPosition: 9, clef: 'treble' },
  { name: 'G#', octave: 5, staffPosition: 9, clef: 'treble' },
  { name: 'A', octave: 5, staffPosition: 10, clef: 'treble' },
  { name: 'A#', octave: 5, staffPosition: 10, clef: 'treble' },
];

// Bass clef: naturals and sharps, G2 through C4
const BASS_NOTES: Note[] = [
  { name: 'G', octave: 2, staffPosition: 0, clef: 'bass' },
  { name: 'G#', octave: 2, staffPosition: 0, clef: 'bass' },
  { name: 'A', octave: 2, staffPosition: 1, clef: 'bass' },
  { name: 'A#', octave: 2, staffPosition: 1, clef: 'bass' },
  { name: 'B', octave: 2, staffPosition: 2, clef: 'bass' },
  { name: 'C', octave: 3, staffPosition: 3, clef: 'bass' },
  { name: 'C#', octave: 3, staffPosition: 3, clef: 'bass' },
  { name: 'D', octave: 3, staffPosition: 4, clef: 'bass' },
  { name: 'D#', octave: 3, staffPosition: 4, clef: 'bass' },
  { name: 'E', octave: 3, staffPosition: 5, clef: 'bass' },
  { name: 'F', octave: 3, staffPosition: 6, clef: 'bass' },
  { name: 'F#', octave: 3, staffPosition: 6, clef: 'bass' },
  { name: 'G', octave: 3, staffPosition: 7, clef: 'bass' },
  { name: 'G#', octave: 3, staffPosition: 7, clef: 'bass' },
  { name: 'A', octave: 3, staffPosition: 8, clef: 'bass' },
  { name: 'A#', octave: 3, staffPosition: 8, clef: 'bass' },
  { name: 'B', octave: 3, staffPosition: 9, clef: 'bass' },
  { name: 'C', octave: 4, staffPosition: 10, clef: 'bass' },
  { name: 'C#', octave: 4, staffPosition: 10, clef: 'bass' },
];

const ALL_NOTES: Note[] = [...TREBLE_NOTES, ...BASS_NOTES];

export function getRandomNote(): Note {
  const index = Math.floor(Math.random() * ALL_NOTES.length);
  return ALL_NOTES[index];
}
