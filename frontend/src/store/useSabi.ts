'use client';
// UI state only. Anything that comes from the backend belongs in lib/queries.ts.
import { create } from 'zustand';

type View = 'import' | 'processing' | 'editor';

interface SabiState {
  view: View;
  activeClipId: string | null;
  time: number; // playhead, seconds
  playing: boolean;
  query: string;
  showBaseline: boolean; // compare with generic captions
  setView: (v: View) => void;
  openClip: (id: string) => void;
  jumpTo: (clipId: string, time: number) => void;
  setTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
  setQuery: (q: string) => void;
  toggleBaseline: () => void;
}

export const useSabi = create<SabiState>((set) => ({
  view: 'import',
  activeClipId: null,
  time: 0,
  playing: false,
  query: '',
  showBaseline: false,
  setView: (view) => set({ view, playing: false }),
  openClip: (id) => set({ activeClipId: id, time: 0, query: '', playing: false, view: 'editor' }),
  jumpTo: (clipId, time) => set({ activeClipId: clipId, time }),
  setTime: (time) => set({ time }),
  setPlaying: (playing) => set({ playing }),
  setQuery: (query) => set({ query }),
  toggleBaseline: () => set((s) => ({ showBaseline: !s.showBaseline })),
}));
