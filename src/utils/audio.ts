import * as Tone from 'tone';

const BASE_URL = 'https://tonejs.github.io/audio/salamander/';

const PIANO_SAMPLES: Record<string, string> = {
  A0: `${BASE_URL}A0.mp3`,
  A1: `${BASE_URL}A1.mp3`,
  A2: `${BASE_URL}A2.mp3`,
  A3: `${BASE_URL}A3.mp3`,
  A4: `${BASE_URL}A4.mp3`,
  A5: `${BASE_URL}A5.mp3`,
  A6: `${BASE_URL}A6.mp3`,
  A7: `${BASE_URL}A7.mp3`,
};

let sampler: Tone.Sampler | null = null;
let loadPromise: Promise<Tone.Sampler> | null = null;

function getSampler(): Promise<Tone.Sampler> {
  if (sampler) return Promise.resolve(sampler);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    sampler = new Tone.Sampler(PIANO_SAMPLES).toDestination();
    await Tone.loaded();
    return sampler!;
  })();

  return loadPromise;
}

function noteNameToTone(name: string, octave: number): string {
  return `${name}${octave}`;
}

async function ensureStarted(): Promise<void> {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
}

export async function playNote(noteName: string, octave: number): Promise<void> {
  const toneNote = noteNameToTone(noteName, octave);
  try {
    await ensureStarted();
    const s = await getSampler();
    s.triggerAttackRelease(toneNote, 0.5, Tone.now(), 0.7);
  } catch {
    // Silently ignore playback errors
  }
}

export function playNoteForLetter(letter: string, octave = 4): void {
  playNote(letter, octave);
}
