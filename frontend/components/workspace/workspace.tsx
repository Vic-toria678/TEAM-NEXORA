"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Captions, Check, ChevronDown, CircleAlert, FileAudio2, FileVideo2, LoaderCircle, LockKeyhole, Search, Sparkles, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { MediaPlayer } from "@/components/workspace/media-player";
import { TranscriptPanel } from "@/components/workspace/transcript-panel";
import { useProjectStore } from "@/stores/useProjectStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { transcribeMedia } from "@/lib/api";
import { exportSrt } from "@/lib/utils";
import type { LanguageCode } from "@/types";

const languages: { code: LanguageCode; label: string }[] = [
  { code: "eng", label: "English" },
  { code: "yor", label: "Yoruba" },
  { code: "ibo", label: "Igbo" },
  { code: "hau", label: "Hausa" },
  { code: "pcm", label: "Nigerian Pidgin" },
];

const supportedExtensions = /\.(mp4|mov|m4v|webm|mp3|wav|m4a|aac|ogg|flac)$/i;

export function Workspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const file = useProjectStore((state) => state.file);
  const language = useProjectStore((state) => state.language);
  const transcript = useProjectStore((state) => state.transcript);
  const status = useProjectStore((state) => state.status);
  const error = useProjectStore((state) => state.error);
  const setFile = useProjectStore((state) => state.setFile);
  const setLanguage = useProjectStore((state) => state.setLanguage);
  const setStatus = useProjectStore((state) => state.setStatus);
  const setError = useProjectStore((state) => state.setError);
  const setTranscript = useProjectStore((state) => state.setTranscript);
  const clearSearch = useSearchStore((state) => state.clear);

  const acceptFile = useCallback((candidate?: File) => {
    if (!candidate) return;
    if (!supportedExtensions.test(candidate.name)) {
      setUploadError("Choose a supported video or audio file: MP4, MOV, WebM, MP3, WAV, M4A, AAC, OGG or FLAC.");
      return;
    }
    setUploadError(null);
    clearSearch();
    setFile(candidate);
  }, [clearSearch, setFile]);

  const handleTranscribe = async () => {
    if (!file || status === "processing") return;
    setStatus("processing");
    setError(null);
    clearSearch();
    try {
      const result = await transcribeMedia(file, language);
      setTranscript(result);
    } catch (reason) {
      setStatus("error");
      setError(reason instanceof Error ? reason.message : "Something went wrong while transcribing.");
    }
  };

  const handleExport = () => {
    if (!transcript.length) return;
    const blob = new Blob([exportSrt(transcript)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${file?.name.replace(/\.[^.]+$/, "") || "sabi-captions"}.srt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Back to home" className="icon-button"><ArrowLeft size={17} /></Link>
          <span className="h-6 w-px bg-line" />
          <Brand />
          <span className="workspace-breadcrumb hidden sm:inline">/ Workspace</span>
        </div>
        <div className="flex items-center gap-3"><span className="privacy-chip"><LockKeyhole size={13} /> Local project</span><ThemeToggle /></div>
      </header>

      <div className="workspace-content">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="section-kicker">YOUR EDITING DESK</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Transcript workspace</h1><p className="mt-1 text-sm text-muted">Find the words. Find the moment. Keep the edit moving.</p></div>
          {file && <button className="button button-quiet button-small" type="button" onClick={() => { useProjectStore.getState().clearProject(); clearSearch(); }}><X size={15} /> Clear project</button>}
        </div>

        {!file ? (
          <div className="workspace-start">
            <section
              className={`upload-zone ${dragging ? "upload-zone-active" : ""}`}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]); }}
            >
              <input ref={inputRef} className="sr-only" type="file" accept="video/*,audio/*,.flac,.m4a,.aac,.ogg" aria-label="Choose a video or audio file" onChange={(event) => acceptFile(event.target.files?.[0])} />
              <span className="upload-icon"><Upload size={23} /></span>
              <h2>Bring your footage into focus</h2>
              <p>Drop a video or audio file here, or browse from your computer.</p>
              <button type="button" className="button button-primary mt-5" onClick={() => inputRef.current?.click()}><Upload size={16} /> Choose a file</button>
              <span className="mt-4 text-xs text-muted">MP4, MOV, WebM, MP3, WAV and more · Files stay on this device</span>
            </section>
            {uploadError && <p className="mt-3 flex items-center gap-2 text-sm text-red-500"><CircleAlert size={16} />{uploadError}</p>}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-panel p-4 text-sm text-muted"><LockKeyhole className="mt-0.5 shrink-0 text-accent" size={16} /><p><b className="font-medium text-secondary">Local-first, always.</b> SABI sends the selected file to your local transcription server at <code className="font-mono text-xs">localhost:8000</code>—never to a SABI cloud.</p></div>
          </div>
        ) : (
          <>
            <div className="workspace-controls panel">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="file-type-icon">{file.type.startsWith("audio/") ? <FileAudio2 size={18} /> : <FileVideo2 size={18} />}</span>
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{file.name}</p><p className="mt-0.5 text-xs text-muted">{(file.size / (1024 * 1024)).toFixed(1)} MB · Kept on this device</p></div>
                </div>
              </div>
              <div className="relative">
                <button type="button" className="language-select" aria-haspopup="listbox" aria-expanded={showLanguageMenu} onClick={() => setShowLanguageMenu((open) => !open)}><span><small>TRANSCRIBE IN</small>{languages.find((item) => item.code === language)?.label}</span><ChevronDown size={15} /></button>
                {showLanguageMenu && <div className="language-menu" role="listbox" aria-label="Choose language">{languages.map((item) => <button key={item.code} type="button" role="option" aria-selected={item.code === language} onClick={() => { setLanguage(item.code); setShowLanguageMenu(false); }}>{item.label}{item.code === language && <Check size={14} />}</button>)}</div>}
              </div>
              <button className="button button-primary" type="button" disabled={status === "processing"} onClick={handleTranscribe}>
                {status === "processing" ? <><LoaderCircle size={16} className="animate-spin" /> Working…</> : status === "success" ? <><Check size={16} /> Transcribe again</> : <><Sparkles size={16} /> Transcribe</>}
              </button>
              {transcript.length > 0 && <button className="button button-outline button-small" type="button" onClick={handleExport}><Captions size={15} /> Export SRT</button>}
            </div>
            <AnimatePresence>
              {status === "processing" && <motion.div className="status-banner status-working" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><LoaderCircle size={17} className="animate-spin" /><div><b>Listening closely to your footage</b><p>Transcription can take a few minutes on CPU. Keep this workspace open.</p></div><span className="status-pulse" /></motion.div>}
              {status === "error" && error && <motion.div className="status-banner status-error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><CircleAlert size={18} /><div><b>We couldn’t transcribe this file</b><p>{error} Check that the local FastAPI server is running, then try again.</p></div></motion.div>}
              {status === "success" && <motion.div className="status-banner status-success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Check size={18} /><div><b>Transcript ready to review</b><p>{transcript.length} timestamped lines · AI output can make mistakes, so review before publishing.</p></div></motion.div>}
            </AnimatePresence>
            <div className="workspace-grid">
              <section className="media-column">
                <MediaPlayer />
                <div className="media-note"><LockKeyhole size={13} /> Media preview stays in your browser</div>
              </section>
              <TranscriptPanel onExportSrt={handleExport} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
