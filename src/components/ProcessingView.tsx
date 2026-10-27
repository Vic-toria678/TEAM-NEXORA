'use client';
import { useClips } from '@/lib/queries';
import type { Stage } from '@/lib/types';
import { useSabi } from '@/store/useSabi';

const STAGE: Record<Stage, string> = {
  loading_model: 'Loading the speech model',
  transcribing: 'Listening to the audio',
  indexing: 'Building the search index',
};

export default function ProcessingView() {
  const { data: clips = [], error } = useClips();
  const openClip = useSabi((s) => s.openClip);
  const ready = clips.filter((c) => c.status === 'ready');
  const allDone = clips.length > 0 && clips.every((c) => c.status === 'ready' || c.status === 'failed');

  return (
    <section className="start">
      <h2>Getting your footage ready</h2>
      <p>{allDone ? 'All clips are done.' : 'This takes a few minutes on a laptop. You can open the editor as soon as the first clip is ready.'}</p>
      {error && <p className="err" role="alert">Can’t reach the backend. Is it running?</p>}
      {clips.map((c) => (
        <div className="job" key={c.id}>
          <b>{c.name}</b>
          <div className="bar"><i style={{ width: `${c.progress}%` }} /></div>
          <small>
            {c.status === 'failed' ? c.error ?? 'Failed' : c.status === 'ready' ? 'Ready' : c.status === 'queued' ? 'Waiting' : `${c.stage ? STAGE[c.stage] : ''} (${c.progress}%)`}
          </small>
        </div>
      ))}
      <div className="row">
        <button className="btn" disabled={!ready.length} onClick={() => openClip(ready[0].id)}>Open editor</button>
      </div>
    </section>
  );
}
