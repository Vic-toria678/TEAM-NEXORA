"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useProjectStore } from "@/stores/useProjectStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { searchTranscript } from "@/lib/search";
import { formatTime } from "@/lib/utils";
import type { SearchResult } from "@/types";

export function TranscriptPanel({ onExportSrt }: { onExportSrt: () => void }) {
  const transcript = useProjectStore((state) => state.transcript);
  const status = useProjectStore((state) => state.status);
  const currentTime = useProjectStore((state) => state.currentTime);
  const seekTo = useProjectStore((state) => state.seekTo);
  const updateSegment = useProjectStore((state) => state.updateSegment);
  const query = useSearchStore((state) => state.query);
  const results = useSearchStore((state) => state.results);
  const isSearching = useSearchStore((state) => state.isSearching);
  const setQuery = useSearchStore((state) => state.setQuery);
  const setResults = useSearchStore((state) => state.setResults);
  const setSearching = useSearchStore((state) => state.setSearching);
  const [activeTab, setActiveTab] = useState<"transcript" | "search">("transcript");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!query.trim() || !transcript.length) {
      setResults([]);
      setSearching(false);
      return;
    }
    let current = true;
    setSearching(true);
    const timeout = window.setTimeout(() => {
      void searchTranscript(query, transcript).then((matches) => {
        if (current) { setResults(matches); setSearching(false); }
      });
    }, 220);
    return () => { current = false; window.clearTimeout(timeout); };
  }, [query, transcript, setResults, setSearching]);

  const jumpToResult = (result: SearchResult) => {
    setActiveTab("transcript");
    seekTo(result.start);
  };

  return (
    <section className="transcript-panel panel">
      <div className="transcript-panel-head">
        <div className="flex items-center gap-2">
          <button type="button" className={`panel-tab ${activeTab === "transcript" ? "panel-tab-active" : ""}`} onClick={() => setActiveTab("transcript")}><FileText size={14} /> Transcript</button>
          <button type="button" className={`panel-tab ${activeTab === "search" ? "panel-tab-active" : ""}`} onClick={() => setActiveTab("search")}><Search size={14} /> Find a moment</button>
        </div>
        {transcript.length > 0 && <span className="text-xs text-muted">{transcript.length} lines</span>}
      </div>
      {activeTab === "search" && (
        <div className="meaning-search">
          <label className="sr-only" htmlFor="meaning-query">Search this footage by meaning</label>
          <Search size={16} />
          <input id="meaning-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Describe the moment you’re looking for…" />
          <span className="search-mode"><Sparkles size={12} /> DEMO</span>
        </div>
      )}
      <div className="transcript-scroll">
        {activeTab === "transcript" && transcript.length > 0 && transcript.map((segment, index) => {
          const isActive = currentTime >= segment.start && currentTime <= segment.end;
          return (
            <motion.article key={`${segment.start}-${index}`} layout initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: Math.min(index * 0.012, 0.3) }} className={`transcript-line ${isActive ? "transcript-line-active" : ""}`} onClick={() => seekTo(segment.start)}>
              <button type="button" className="timestamp" aria-label={`Seek to ${formatTime(segment.start)}`} onClick={(event) => { event.stopPropagation(); seekTo(segment.start); }}>{formatTime(segment.start)}</button>
              {editingIndex === index ? (
                <textarea autoFocus aria-label={`Edit transcript line ${index + 1}`} className="transcript-edit" rows={Math.max(2, Math.ceil(segment.text.length / 52))} value={segment.text} onChange={(event) => updateSegment(index, event.target.value)} onBlur={() => setEditingIndex(null)} onKeyDown={(event) => { if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) { event.preventDefault(); setEditingIndex(null); } }} onClick={(event) => event.stopPropagation()} />
              ) : (
                <button type="button" className="transcript-text" onClick={(event) => { event.stopPropagation(); setEditingIndex(index); }}>{segment.text}</button>
              )}
            </motion.article>
          );
        })}
        {activeTab === "transcript" && transcript.length === 0 && (
          <div className="transcript-empty">
            {status === "processing" ? <><span className="empty-spinner"><Sparkles size={19} /></span><b>Your transcript is taking shape</b><p>Long recordings can take a few minutes. You can stay here while SABI listens.</p></> : <><span className="empty-spinner"><FileText size={19} /></span><b>Your transcript will appear here</b><p>Choose a language and transcribe your footage. Click a line to jump to that moment. Click the words to edit.</p></>}
          </div>
        )}
        {activeTab === "search" && (
          <div className="search-results">
            {!transcript.length ? <div className="transcript-empty"><span className="empty-spinner"><Search size={18} /></span><b>Nothing to search yet</b><p>Transcribe this clip first. Then describe a moment in your own words.</p></div>
              : !query.trim() ? <div className="transcript-empty search-hint"><span className="empty-spinner"><Sparkles size={18} /></span><b>What are you looking for?</b><p>Try a topic, phrase or idea from the conversation. Results jump straight to the timestamp.</p></div>
              : isSearching ? <div className="transcript-empty"><span className="animate-spin text-accent"><Sparkles size={19} /></span><b>Finding moments…</b><p>Searching your transcript for related words.</p></div>
              : results.length ? <><p className="search-demo-note"><Sparkles size={13} /> Demo search matches related words in this transcript. Semantic embeddings can plug in here.</p>{results.map((result) => <button type="button" key={result.id} className="search-result" onClick={() => jumpToResult(result)}><span className="search-result-time">{formatTime(result.start)}</span><span>{result.text}</span><span className="search-score">{Math.round(result.score * 100)}%</span></button>)}</>
              : <div className="transcript-empty"><span className="empty-spinner"><Search size={18} /></span><b>No matching moments yet</b><p>Try different words or a shorter phrase from the conversation.</p></div>}
          </div>
        )}
      </div>
      {transcript.length > 0 && <div className="transcript-panel-foot"><span><span className="editing-dot" /> Click any line to seek · click text to edit</span><button type="button" onClick={onExportSrt}><Check size={13} /> Export SRT</button></div>}
      <AnimatePresence>{activeTab === "search" && query && results.length > 0 && <motion.span className="sr-only" role="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{results.length} search results found.</motion.span>}</AnimatePresence>
    </section>
  );
}
