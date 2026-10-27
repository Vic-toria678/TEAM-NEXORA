import type { Clip, ClipDetail, Language, LanguageOption, SearchHit } from './types';
import * as mock from './mock';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  uploadFiles(files: File[], language: Language): Promise<Clip[]> {
    if (MOCK) return mock.upload(files.map((f) => f.name));
    const body = new FormData();
    files.forEach((f) => body.append('files', f));
    body.append('language', language);
    return req('/api/clips', { method: 'POST', body });
  },
  languages: (): Promise<LanguageOption[]> => (MOCK ? mock.languages() : req('/api/languages')),
  listClips: (): Promise<Clip[]> => (MOCK ? mock.list() : req('/api/clips')),
  getClip: (id: string): Promise<ClipDetail> => (MOCK ? mock.get(id) : req(`/api/clips/${id}`)),
  search: (q: string): Promise<SearchHit[]> => (MOCK ? mock.search(q) : req(`/api/search?q=${encodeURIComponent(q)}`)),
  editSegment: (id: string, index: number, text: string) =>
    MOCK
      ? mock.edit(id, index, text)
      : req(`/api/clips/${id}/segments/${index}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }),
  mediaUrl: (id: string) => `${BASE}/api/clips/${id}/media`,
  srtUrl: (id: string) => `${BASE}/api/clips/${id}/captions.srt`,
};
