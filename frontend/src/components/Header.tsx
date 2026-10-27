'use client';
import { api } from '@/lib/api';
import { useSabi } from '@/store/useSabi';

export default function Header() {
  const { view, setView, activeClipId } = useSabi();
  return (
    <header>
      <div>
        <h1>Sabi</h1>
        <span>Search your footage by meaning. Captions that understand Nigerian speech.</span>
      </div>
      {view === 'editor' && (
        <div className="row" style={{ margin: 0 }}>
          <button className="btn ghost" onClick={() => setView('import')}>Add files</button>
          {activeClipId && <a className="btn" href={api.srtUrl(activeClipId)} download>Export .srt</a>}
        </div>
      )}
    </header>
  );
}
