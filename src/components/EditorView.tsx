'use client';
// TODO: port the three panels from the prototype (Footage list, Player, Search + transcript).
// This stub only proves the data flow: Zustand (which clip, playhead) + React Query (clip data).
import { useClip } from '@/lib/queries';
import { useSabi } from '@/store/useSabi';

export default function EditorView() {
  const { activeClipId, time, jumpTo } = useSabi();
  const { data: clip, isLoading } = useClip(activeClipId);
  if (isLoading || !clip) return <p className="empty">Loading…</p>;
  return (
    <section className="start">
      <h2>{clip.name}</h2>
      <p>Playhead: {time.toFixed(1)}s. Click a line to jump.</p>
      {clip.segments.map((s, i) => (
        <div className="seg" key={i}>
          <button className="ts" onClick={() => jumpTo(clip.id, s.start)}>{s.start.toFixed(0)}s</button>
          <span className="tx">{s.text}</span>
        </div>
      ))}
    </section>
  );
}
