'use client';
import { useRef, useState } from 'react';
import { useLanguages, useUpload } from '@/lib/queries';
import type { Language } from '@/lib/types';
import { useSabi } from '@/store/useSabi';

const OK = /\.(mp4|mov|mkv|webm|mp3|wav|m4a)$/i;

export default function ImportView() {
  const [language, setLanguage] = useState<Language>('');
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const setView = useSabi((s) => s.setView);
  const upload = useUpload();
  const { data: languages = [] } = useLanguages();
  const chosen = language || languages[0]?.code || 'auto';

  function take(list: FileList | null) {
    const files = Array.from(list ?? []).filter((f) => OK.test(f.name));
    if (!files.length) {
      setError('Sabi can’t read that file type. Use MP4, MOV, MKV, WEBM, MP3, WAV or M4A.');
      return;
    }
    setError(null);
    upload.mutate({ files, language: chosen }, { onSuccess: () => setView('processing'), onError: (e) => setError(e.message) });
  }

  return (
    <section className="start">
      <h2>Add your footage</h2>
      <p>Sabi listens to your clips on this computer, so you can search them by what was said.</p>
      <div
        className={`drop${over ? ' over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
      >
        <strong>Drop video or audio files here</strong>
        <span>MP4, MOV, MKV, WEBM, MP3, WAV or M4A</span>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={() => input.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? 'Uploading…' : 'Choose files'}
          </button>
        </div>
        <input ref={input} type="file" accept="video/*,audio/*,.mkv" multiple hidden onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="field">
        <label htmlFor="lang"><b>What language is spoken?</b></label>
        <select id="lang" value={chosen} onChange={(e) => setLanguage(e.target.value as Language)}>
          {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          <option value="auto">Not sure, detect it</option>
        </select>
        <small>If you know the language, pick it. Detecting it can guess wrong.</small>
      </div>
    </section>
  );
}
