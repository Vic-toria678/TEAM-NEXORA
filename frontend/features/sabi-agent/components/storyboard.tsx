"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ChevronDown, Copy, Download, FileJson2, GripVertical, LockKeyhole, Magnet, Pause, Play, RotateCcw, RotateCw, Scissors, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatTimecode, totalDuration } from "../utils";
import type { ArcSlot, StoryClip } from "../types";

const arcSlots: ArcSlot[] = ["Hook", "Setup", "Tension", "Payoff", "Closer"];
export type ExportType = "json" | "srt" | "csv" | "copy";

export function Storyboard({
  clips,
  targetLength,
  previewIndex,
  previewCaption,
  isPlaying,
  canUndo,
  canRedo,
  onPlay,
  onPause,
  onRestart,
  onPrevious,
  onNext,
  onReorder,
  onNudge,
  onSlot,
  onLock,
  onDuplicate,
  onRemove,
  onUndo,
  onRedo,
  onExport,
  onTrimForMe,
}: {
  clips: StoryClip[];
  targetLength: number;
  previewIndex: number | null;
  previewCaption: string;
  isPlaying: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onReorder: (from: number, to: number) => void;
  onNudge: (id: string, edge: "start" | "end", delta: number, snap: boolean) => void;
  onSlot: (id: string, slot: ArcSlot | null) => void;
  onLock: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (type: ExportType) => void;
  onTrimForMe: () => void;
}) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [freeTrim, setFreeTrim] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const reduceMotion = useReducedMotion();
  const duration = totalDuration(clips);
  const progress = targetLength > 0 ? Math.min(100, duration / targetLength * 100) : 0;
  const overTarget = duration > targetLength;
  const filledSlots = new Set(clips.map((clip) => clip.arcSlot).filter(Boolean));

  const moveClip = (from: number, to: number) => {
    onReorder(from, to);
    if (from !== to) setAnnouncement(`Clip ${from + 1} moved to position ${to + 1}.`);
  };

  return (
    <section className="sabi-storyboard" aria-labelledby="sabi-storyboard-heading">
      <div className="sabi-subhead">
        <div><h3 id="sabi-storyboard-heading">Your storyboard</h3><span>{clips.length} {clips.length === 1 ? "clip" : "clips"}</span></div>
        <div className="sabi-history-actions">
          <button type="button" aria-label="Undo" title="Undo (Ctrl/Cmd+Z)" disabled={!canUndo} onClick={onUndo}><RotateCcw size={14} /></button>
          <button type="button" aria-label="Redo" title="Redo (Shift+Ctrl/Cmd+Z)" disabled={!canRedo} onClick={onRedo}><RotateCw size={14} /></button>
        </div>
      </div>

      <div className="sabi-arc-rail" aria-label="Story arc">
        {arcSlots.map((slot, index) => <div key={slot} className={`sabi-arc-slot ${filledSlots.has(slot) ? "sabi-arc-filled" : ""}`}><span>{index + 1}</span><b>{slot}</b></div>)}
      </div>
      {arcSlots.some((slot) => !filledSlots.has(slot)) && clips.length > 0 && <p className="sabi-arc-hint">Arc gaps: {arcSlots.filter((slot) => !filledSlots.has(slot)).join(", ")}.</p>}

      <div className="sabi-duration-wrap">
        <div className="sabi-duration-label"><span><Scissors size={13} /> {formatTimecode(duration)} of {formatTimecode(targetLength)}</span><b>{overTarget ? "Over target" : duration === 0 ? "Ready when you are" : `${Math.round(progress)}%`}</b></div>
        <div className="sabi-duration-track" role="progressbar" aria-label="Teaser duration" aria-valuemin={0} aria-valuemax={targetLength} aria-valuenow={Math.min(targetLength, Math.round(duration))} aria-valuetext={`${Math.round(duration)} seconds of ${targetLength} seconds`}>
          <span style={{ width: `${progress}%` }} className={overTarget ? "sabi-duration-over" : ""} />
        </div>
        {overTarget && <p className="sabi-over-target">A little over your target. <button type="button" onClick={onTrimForMe}>Trim for me</button></p>}
      </div>
      {clips.length > 0 && <button type="button" className={`sabi-snap-toggle ${freeTrim ? "" : "sabi-snap-enabled"}`} aria-pressed={!freeTrim} onClick={() => setFreeTrim((value) => !value)}><Magnet size={12} /> Caption snap {freeTrim ? "off" : "on"}</button>}

      {clips.length ? (
        <div className="sabi-clip-list" role="list" aria-label="Storyboard clips">
          {clips.map((clip, index) => (
            <motion.div key={clip.id} layout={!reduceMotion} transition={{ layout: { duration: reduceMotion ? 0 : 0.22, ease: "easeOut" } }} role="listitem">
              <article className={`sabi-clip-card ${previewIndex === index ? "sabi-clip-active" : ""}`} draggable={!clip.locked}
                onDragStart={(event) => { setDragFrom(index); event.dataTransfer.effectAllowed = "move"; }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); if (dragFrom !== null) moveClip(dragFrom, index); setDragFrom(null); }}
                onDragEnd={() => setDragFrom(null)}>
                <div className="sabi-clip-top">
                  <button type="button" className="sabi-drag-handle" aria-label={`Clip ${index + 1} reorder handle. Use the up and down buttons to reorder.`} title="Drag to reorder" disabled={clip.locked}><GripVertical size={15} /></button>
                  <span className="sabi-clip-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className={`sabi-type-tag sabi-type-${clip.type.toLowerCase().replace(" ", "-")}`}>{clip.type}</span>
                  <span className="sabi-clip-time">{formatTimecode(clip.end - clip.start)}</span>
                </div>
                <p className="sabi-clip-text">{clip.text}</p>
                <div className="sabi-clip-trim">
                  <span>{formatTimecode(clip.start)}–{formatTimecode(clip.end)}</span>
                  <div><button type="button" aria-label="Trim clip start earlier by 0.5 seconds" title="Start −0.5s" disabled={clip.locked} onClick={() => onNudge(clip.id, "start", -0.5, !freeTrim)}>−</button><button type="button" aria-label="Trim clip start later by 0.5 seconds" title="Start +0.5s" disabled={clip.locked} onClick={() => onNudge(clip.id, "start", 0.5, !freeTrim)}>+</button><button type="button" aria-label="Trim clip end earlier by 0.5 seconds" title="End −0.5s" disabled={clip.locked} onClick={() => onNudge(clip.id, "end", -0.5, !freeTrim)}>−</button><button type="button" aria-label="Trim clip end later by 0.5 seconds" title="End +0.5s" disabled={clip.locked} onClick={() => onNudge(clip.id, "end", 0.5, !freeTrim)}>+</button></div>
                </div>
                <div className="sabi-clip-bottom">
                  <label className="sr-only" htmlFor={`arc-${clip.id}`}>Assign story arc slot</label>
                  <select id={`arc-${clip.id}`} className="sabi-arc-select" value={clip.arcSlot ?? ""} disabled={clip.locked} onChange={(event) => onSlot(clip.id, (event.target.value || null) as ArcSlot | null)}>
                    <option value="">Arc slot…</option>{arcSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                  <div className="sabi-clip-actions">
                    <button type="button" aria-label={`Move clip ${index + 1} up`} title="Move up" disabled={index === 0 || clip.locked || clips[index - 1]?.locked} onClick={() => moveClip(index, index - 1)}><ArrowUp size={13} /></button>
                    <button type="button" aria-label={`Move clip ${index + 1} down`} title="Move down" disabled={index === clips.length - 1 || clip.locked || clips[index + 1]?.locked} onClick={() => moveClip(index, index + 1)}><ArrowDown size={13} /></button>
                    <button type="button" aria-label={clip.locked ? "Unlock clip" : "Lock clip"} title={clip.locked ? "Unlock" : "Lock"} onClick={() => onLock(clip.id)}><LockKeyhole size={13} className={clip.locked ? "sabi-lock-active" : ""} /></button>
                    <button type="button" aria-label="Duplicate clip" title="Duplicate" onClick={() => onDuplicate(clip.id)}><Copy size={13} /></button>
                    <button type="button" aria-label="Remove clip" title="Remove" onClick={() => onRemove(clip.id)}><Trash2 size={13} /></button>
                  </div>
                </div>
              </article>
            </motion.div>
          ))}
        </div>
      ) : <div className="sabi-storyboard-empty"><span><Scissors size={17} /></span><b>Your teaser starts here</b><p>Add a moment, then shape the story from hook to closer.</p></div>}

      <div className="sabi-story-actions">
        <button type="button" className="button button-primary button-small" disabled={!clips.length} onClick={isPlaying ? onPause : onPlay}>{isPlaying ? <><Pause size={14} /> Pause teaser</> : <><Play size={14} /> Play teaser</>}</button>
        <button type="button" className="sabi-transport-button" aria-label="Restart teaser" title="Restart teaser" disabled={!clips.length} onClick={onRestart}><RotateCcw size={14} /></button>
        <button type="button" className="sabi-transport-button" aria-label="Previous clip" disabled={!clips.length} onClick={onPrevious}>‹</button>
        <button type="button" className="sabi-transport-button" aria-label="Next clip" disabled={!clips.length} onClick={onNext}>›</button>
        <div className="sabi-export-wrap">
          <button type="button" className="button button-outline button-small" disabled={!clips.length} aria-expanded={exportOpen} onClick={() => setExportOpen((open) => !open)}><Download size={14} /> Export <ChevronDown size={13} /></button>
          {exportOpen && <div className="sabi-export-menu" role="menu" aria-label="Export teaser">
            <button type="button" role="menuitem" onClick={() => { onExport("json"); setExportOpen(false); }}><FileJson2 size={14} /> Download JSON</button>
            <button type="button" role="menuitem" onClick={() => { onExport("srt"); setExportOpen(false); }}><Download size={14} /> Download SRT</button>
            <button type="button" role="menuitem" onClick={() => { onExport("csv"); setExportOpen(false); }}><Download size={14} /> Download CSV</button>
            <button type="button" role="menuitem" onClick={() => { onExport("copy"); setExportOpen(false); }}><Check size={14} /> Copy cut list</button>
          </div>}
        </div>
      </div>
      {previewIndex !== null && clips[previewIndex] && <div className="sabi-preview-caption" aria-live="polite"><span>{isPlaying ? "NOW PLAYING" : "PAUSED"} · {formatTimecode(clips[previewIndex].start)}</span><p>{previewCaption || clips[previewIndex].text}</p></div>}
      <div className="sabi-segmented-progress" role="img" aria-label={`${clips.length} teaser clips`}>
        {clips.map((clip, index) => <span key={clip.id} className={previewIndex === index ? "sabi-segment-current" : ""} style={{ flexGrow: Math.max(1, clip.end - clip.start) }} />)}
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </section>
  );
}
