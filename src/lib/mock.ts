// Fake backend so the UI works before the real one exists. Same shapes as docs/API.md.
import type { Clip, ClipDetail, SearchHit, Segment } from './types';

const SEGMENTS: Segment[] = [
  { start: 0, end: 12, text: 'Good afternoon ma, tell us how the business started.', lowConfidenceWords: [] },
  { start: 12, end: 31, text: 'I started selling ankara fabric for Yaba market, na 2015 I begin.', lowConfidenceWords: ['ankara', 'Yaba'], baselineText: 'I started selling and cara fabric for yaw by market, nah 2015 I began.' },
  { start: 31, end: 52, text: 'The delivery fee is what worries me, riders charge too much now.', lowConfidenceWords: [], baselineText: 'The delivery fee is what worry me, writers charge too much now.' },
];
type Job = { id: string; name: string; startedAt: number };
let jobs: Job[] = [];

const progress = (j: Job) => Math.max(0, Math.min(100, Math.round((Date.now() - j.startedAt) / 150)));
function toClip(j: Job): Clip {
  const p = progress(j);
  return {
    id: j.id, name: j.name, durationSec: 52, progress: p,
    status: p >= 100 ? 'ready' : p === 0 ? 'queued' : 'processing',
    stage: p >= 100 || p === 0 ? null : p < 15 ? 'loading_model' : p < 85 ? 'transcribing' : 'indexing',
  };
}
const wait = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 150));

export const upload = (names: string[]) => {
  const fresh = names.map((name, i) => ({ id: `m${jobs.length + i}`, name, startedAt: Date.now() + i * 3000 }));
  jobs = [...jobs, ...fresh];
  return wait(fresh.map(toClip));
};
export const languages = () => wait([{ code: 'en-ng', label: 'English (Nigerian accent)' }, { code: 'yo', label: 'Yoruba' }, { code: 'ig', label: 'Igbo' }]);
export const list = () => wait(jobs.map(toClip));
export const get = (id: string): Promise<ClipDetail> => {
  const c = toClip(jobs.find((x) => x.id === id)!);
  return wait({ ...c, segments: c.status === 'ready' ? SEGMENTS : [] });
};
export const edit = (id: string, index: number, text: string) => {
  SEGMENTS[index] = { ...SEGMENTS[index], text };
  return wait({ ok: true });
};
export const search = (q: string): Promise<SearchHit[]> => {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const hits: SearchHit[] = [];
  jobs.map(toClip).filter((c) => c.status === 'ready').forEach((c) =>
    SEGMENTS.forEach((s, i) => {
      if (words.some((w) => s.text.toLowerCase().includes(w)))
        hits.push({ clipId: c.id, clipName: c.name, segmentIndex: i, start: s.start, end: s.end, text: s.text, matchType: 'exact', score: 1 });
    }));
  return wait(hits);
};
