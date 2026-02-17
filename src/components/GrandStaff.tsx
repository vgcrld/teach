import { useEffect, useRef } from 'react';
import type { Note } from '../utils/notes';
import type { StaffNote } from '../hooks/useGameLogic';

// Unicode musical symbols (U+1D11E treble, U+1D122 bass) - use Noto Music font
const TREBLE_CLEF = '\u{1D11E}';
const BASS_CLEF = '\u{1D122}';

interface GrandStaffProps {
  notes: StaffNote[];
}

// Layout constants
const VIEWBOX_HEIGHT = 320;
const STAFF_LEFT = 20;
const CLEF_X = 52;
const CLEF_SIZE = 64;
const LINE_SPACING = 12;
const FIRST_NOTE_X = 105;
const NOTE_SPACING = 52;
const LEDGER_LENGTH = 24;
const STAFF_EXTEND = 60;

// Treble staff: lines at y 50, 62, 74, 86, 98 (bottom line = E4 = pos 0)
const TREBLE_BOTTOM_Y = 98;
const TREBLE_TOP_Y = 50;

// Bass staff: lines at y 182, 194, 206, 218, 230
const BASS_TOP_Y = 182;
const BASS_BOTTOM_Y = 230;

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

function SingleNote({ note, x }: { note: Note; x: number }) {
  const noteY = getNoteY(note);
  const stemUp = note.clef === 'treble' ? noteY >= 74 : noteY >= 206;
  const stemLength = 42;
  const stemX = stemUp ? x + 8 : x - 8;

  return (
    <g className="note-group">
      {getLedgerLines(note).map((y, i) => (
        <line
          key={i}
          x1={x - LEDGER_LENGTH}
          y1={y}
          x2={x + LEDGER_LENGTH}
          y2={y}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
      <ellipse cx={x} cy={noteY} rx={8} ry={6} fill="currentColor" />
      <line
        x1={stemX}
        y1={noteY}
        x2={stemX}
        y2={stemUp ? noteY - stemLength : noteY + stemLength}
        stroke="currentColor"
        strokeWidth="2"
      />
    </g>
  );
}

export function GrandStaff({ notes }: GrandStaffProps) {
  const contentRight = notes.length > 0
    ? FIRST_NOTE_X + (notes.length - 1) * NOTE_SPACING + STAFF_EXTEND
    : 600;
  const viewBoxWidth = Math.max(600, contentRight);
  const staffRight = viewBoxWidth - 20;

  const svgHeight = 240;
  const svgWidth = (viewBoxWidth / VIEWBOX_HEIGHT) * svgHeight;
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (el && notes.length > 0) {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    }
  }, [notes.length]);

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

        {/* Brace */}
        <path
          d="M 22 48 Q 18 140 22 232"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
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

        {/* Notes - left to right */}
        {notes.map(({ note, answered }, i) => (
          <g
            key={i}
            className={answered ? 'note-answered' : 'note-current'}
            style={{ opacity: answered ? 0.7 : 1 }}
          >
            <SingleNote note={note} x={FIRST_NOTE_X + i * NOTE_SPACING} />
          </g>
        ))}
      </svg>
    </div>
  );
}
