import { useEffect, useRef } from 'react';
import { GrandStaff } from './GrandStaff';
import type { StaffNote } from '../hooks/useGameLogic';

const NOTES_PER_STAFF = 16; // 4 measures × 4 notes

function chunkNotes(notes: StaffNote[]): StaffNote[][] {
  const chunks: StaffNote[][] = [];
  for (let i = 0; i < notes.length; i += NOTES_PER_STAFF) {
    chunks.push(notes.slice(i, i + NOTES_PER_STAFF));
  }
  return chunks.length > 0 ? chunks : [[]];
}

interface StaffScrollerProps {
  notes: StaffNote[];
}

export function StaffScroller({ notes }: StaffScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const chunks = chunkNotes(notes);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }, [notes.length]);

  return (
    <div
      ref={scrollRef}
      className="staff-scroller"
      aria-label="Music staves"
    >
      {chunks.map((staffNotes, i) => (
        <div key={i} className="staff-chunk">
          <GrandStaff notes={staffNotes} fixedMeasures={4} />
        </div>
      ))}
    </div>
  );
}
