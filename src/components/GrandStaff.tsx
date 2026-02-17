import { useEffect, useRef } from 'react';
import type { Note } from '../utils/notes';
import type { StaffNote } from '../hooks/useGameLogic';

// Unicode musical symbols (U+1D11E treble, U+1D122 bass) - use Noto Music font
const TREBLE_CLEF = '\u{1D11E}';
const BASS_CLEF = '\u{1D122}';

interface GrandStaffProps {
  notes: StaffNote[];
}

// Layout: left-to-right = brace | clef | time sig | bar | [measure: 4 notes] | bar | ...
const VIEWBOX_HEIGHT = 320;
const STAFF_LEFT = 20;
const CLEF_X = 48;
const CLEF_SIZE = 60;
const TIME_SIG_X = 78;
const FIRST_BAR_X = 92;
const MEASURE_WIDTH = 200; // each 4/4 measure
const NOTES_PER_MEASURE = 4;
const LINE_SPACING = 12;
const LEDGER_LENGTH = 14;
const STAFF_EXTEND = 60;

// Notes at 1/8, 3/8, 5/8, 7/8 of measure width (evenly spaced with margins)
const NOTE_OFFSETS_IN_MEASURE = [1 / 8, 3 / 8, 5 / 8, 7 / 8].map(
  (f) => f * MEASURE_WIDTH
);

function getNoteX(index: number): number {
  const measureIndex = Math.floor(index / NOTES_PER_MEASURE);
  const noteInMeasure = index % NOTES_PER_MEASURE;
  const measureStart = FIRST_BAR_X + measureIndex * MEASURE_WIDTH;
  return measureStart + NOTE_OFFSETS_IN_MEASURE[noteInMeasure];
}

function getBarLineX(measureIndex: number): number {
  return FIRST_BAR_X + measureIndex * MEASURE_WIDTH;
}

// Treble staff: lines at y 70, 82, 94, 106, 118 (bottom line = E4 = pos 0)
const TREBLE_BOTTOM_Y = 118;
const TREBLE_TOP_Y = 70;

// Bass staff: lines at y 170, 182, 194, 206, 218
const BASS_TOP_Y = 170;
const BASS_BOTTOM_Y = 218;

function getNoteY(note: Note): number {
  if (note.clef === 'treble') {
    return TREBLE_BOTTOM_Y - note.staffPosition * (LINE_SPACING / 2);
  } else {
    return BASS_BOTTOM_Y - note.staffPosition * (LINE_SPACING / 2);
  }
}

function getLedgerLines(note: Note): number[] {
  const lines: number[] = [];
  const halfSpace = LINE_SPACING / 2;

  // Ledger lines only for notes ON a line (even positions). Notes in spaces (odd positions) have no ledger line.
  const isOnLine = note.staffPosition % 2 === 0;
  if (!isOnLine) return lines;

  if (note.clef === 'treble') {
    if (note.staffPosition < 0) {
      for (let p = note.staffPosition; p < 0; p += 2) {
        lines.push(TREBLE_BOTTOM_Y - p * halfSpace);
      }
    } else if (note.staffPosition > 8) {
      for (let p = 10; p <= note.staffPosition; p += 2) {
        lines.push(TREBLE_BOTTOM_Y - p * halfSpace);
      }
    }
  } else {
    if (note.staffPosition < 0) {
      for (let p = note.staffPosition; p < 0; p += 2) {
        lines.push(BASS_BOTTOM_Y - p * halfSpace);
      }
    } else if (note.staffPosition > 8) {
      for (let p = 10; p <= note.staffPosition; p += 2) {
        lines.push(BASS_BOTTOM_Y - p * halfSpace);
      }
    }
  }
  return lines;
}

// Sharp symbol: two verticals + two diagonals (slash and backslash crossing)
function SharpSymbol({ x }: { x: number }) {
  const w = 4.5;
  const h = 7;
  return (
    <g transform={`translate(${x}, 0)`} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
      <line x1={0} y1={-h} x2={0} y2={h} />
      <line x1={-w} y1={-h} x2={-w} y2={h} />
      <line x1={-w} y1={-2} x2={0} y2={3} />
      <line x1={-w} y1={2} x2={0} y2={-3} />
    </g>
  );
}

function SingleNote({ note, x }: { note: Note; x: number }) {
  const noteY = getNoteY(note);
  const stemUp = note.clef === 'treble' ? noteY >= 94 : noteY >= 194;
  const stemLength = 42;
  const hasSharp = note.name.includes('#');

  const ledgerLeft = hasSharp ? x - 22 : x - LEDGER_LENGTH;
  const ledgerRight = x + LEDGER_LENGTH;

  return (
    <g className="note-group">
      {getLedgerLines(note).map((y, i) => (
        <line
          key={i}
          x1={ledgerLeft}
          y1={y}
          x2={ledgerRight}
          y2={y}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
      <g transform={`translate(${x}, ${noteY})`}>
        {hasSharp && <SharpSymbol x={-10} />}
        <ellipse cx={0} cy={0} rx={8} ry={6} fill="currentColor" />
        <line
          x1={stemUp ? 8 : -8}
          y1={0}
          x2={stemUp ? 8 : -8}
          y2={stemUp ? -stemLength : stemLength}
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>
    </g>
  );
}

export function GrandStaff({ notes }: GrandStaffProps) {
  const measureCount = Math.ceil(notes.length / NOTES_PER_MEASURE) || 1;
  const lastBarX = getBarLineX(measureCount);
  const contentRight = notes.length > 0
    ? lastBarX + STAFF_EXTEND
    : 400;
  const viewBoxWidth = Math.max(500, contentRight);
  const staffRight = viewBoxWidth - 20;

  const barLineXCoords: number[] = [];
  for (let m = 0; m <= measureCount; m++) {
    barLineXCoords.push(getBarLineX(m));
  }

  const svgHeight = 280;
  const svgWidth = (viewBoxWidth / VIEWBOX_HEIGHT) * svgHeight;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const firstUnansweredIndex = notes.findIndex((n) => !n.answered);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || notes.length === 0) return;
    const scale = svgWidth / viewBoxWidth;
    if (firstUnansweredIndex >= 0) {
      const noteX = getNoteX(firstUnansweredIndex);
      el.scrollLeft = Math.max(0, noteX * scale - 40);
    } else {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    }
  }, [notes.length, firstUnansweredIndex, viewBoxWidth, svgWidth]);

  return (
    <div className="grand-staff-wrapper" ref={wrapperRef}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${VIEWBOX_HEIGHT}`}
        className="grand-staff"
        preserveAspectRatio="xMinYMid meet"
        style={{ width: svgWidth, height: svgHeight }}
      >
        {/* Treble staff lines - full width */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`treble-${i}`}
            x1={STAFF_LEFT}
            y1={TREBLE_TOP_Y + i * LINE_SPACING}
            x2={staffRight}
            y2={TREBLE_TOP_Y + i * LINE_SPACING}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}

        {/* Bass staff lines - full width */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`bass-${i}`}
            x1={STAFF_LEFT}
            y1={BASS_TOP_Y + i * LINE_SPACING}
            x2={staffRight}
            y2={BASS_TOP_Y + i * LINE_SPACING}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}

        {/* Straight vertical line connecting the two staves */}
        <line
          x1={STAFF_LEFT}
          y1={TREBLE_TOP_Y}
          x2={STAFF_LEFT}
          y2={BASS_BOTTOM_Y}
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Curly brace */}
        <path
          d={`M ${STAFF_LEFT} ${TREBLE_TOP_Y} C 4 ${TREBLE_TOP_Y}, 4 144, ${STAFF_LEFT} 144 C 4 144, 4 ${BASS_BOTTOM_Y}, ${STAFF_LEFT} ${BASS_BOTTOM_Y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />

        {/* Treble clef */}
        <text
          x={CLEF_X}
          y={(TREBLE_TOP_Y + TREBLE_BOTTOM_Y) / 2}
          fontSize={CLEF_SIZE}
          fontFamily="'Noto Music', sans-serif"
          fill="currentColor"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {TREBLE_CLEF}
        </text>

        {/* Bass clef */}
        <text
          x={CLEF_X}
          y={(BASS_TOP_Y + BASS_BOTTOM_Y) / 2}
          fontSize={CLEF_SIZE}
          fontFamily="'Noto Music', sans-serif"
          fill="currentColor"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {BASS_CLEF}
        </text>

        {/* 4/4 time signature (between staves) */}
        <g fontFamily="'Noto Music', sans-serif" fill="currentColor" fontSize={22} textAnchor="middle">
          <text x={TIME_SIG_X} y={132} dominantBaseline="alphabetic">4</text>
          <text x={TIME_SIG_X} y={152} dominantBaseline="hanging">4</text>
        </g>

        {/* Bar lines */}
        {barLineXCoords.map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={TREBLE_TOP_Y}
            x2={x}
            y2={BASS_BOTTOM_Y}
            stroke="currentColor"
            strokeWidth={i === 0 ? "2" : "1.5"}
          />
        ))}

        {/* Notes - left to right */}
        {notes.map(({ note, answered }, i) => (
          <g
            key={i}
            className={answered ? 'note-answered' : 'note-current'}
            style={{ opacity: answered ? 0.7 : 1 }}
          >
            <SingleNote note={note} x={getNoteX(i)} />
          </g>
        ))}
      </svg>
    </div>
  );
}
