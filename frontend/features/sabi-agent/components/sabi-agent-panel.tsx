"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, Check, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TranscriptSegment } from "@/types";
import { useProjectStore } from "@/stores/useProjectStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { sabiAgentMockService } from "../service";
import { useSabiAgentStore, createChatMessage } from "../store";
import { exportCutListCsv, exportCutListJson, exportCutListSrt, formatClipboardCutList, mapTranscriptToStorySegments } from "../utils";
import type { AgentChatMessage, ArcSlot, StoryClip, StoryMoment } from "../types";
import { AgentChat } from "./agent-chat";
import { MomentFinder } from "./moment-finder";
import { StoryBriefForm } from "./story-brief";
import { Storyboard, type ExportType } from "./storyboard";

const loadingMessages = ["Finding strong hooks…", "Checking for punchlines…", "Looking for the story’s payoff…"];
const validTones = ["Funny", "Emotional", "Hype", "Inspiring", "Controversial", "Educational"];
const validPlatforms = ["Instagram Reel", "TikTok", "YouTube Shorts", "X / Twitter", "YouTube Trailer"];
const validMomentTypes = ["Hook", "Funny", "Emotional", "Insight", "Hot Take", "Punchline", "Cliffhanger", "Story Beat"];
const validArcSlots = ["Hook", "Setup", "Tension", "Payoff", "Closer"];

function isSavedStoryboard(value: unknown): value is { brief: ReturnType<typeof useSabiAgentStore.getState>["brief"]; storyboard: StoryClip[] } {
  if (!value || typeof value !== "object" || !("brief" in value) || !("storyboard" in value)) return false;
  const saved = value as { brief: unknown; storyboard: unknown };
  if (!saved.brief || typeof saved.brief !== "object" || !Array.isArray(saved.storyboard)) return false;
  const brief = saved.brief as Record<string, unknown>;
  return typeof brief.targetLength === "number" && Number.isFinite(brief.targetLength) && brief.targetLength >= 5 && brief.targetLength <= 600 &&
    Array.isArray(brief.tone) && brief.tone.every((tone) => validTones.includes(String(tone))) &&
    typeof brief.platform === "string" && validPlatforms.includes(brief.platform) &&
    typeof brief.about === "string" &&
    saved.storyboard.every((item) => {
      if (!item || typeof item !== "object") return false;
      const clip = item as Record<string, unknown>;
      return typeof clip.id === "string" && typeof clip.momentId === "string" &&
        typeof clip.start === "number" && Number.isFinite(clip.start) && clip.start >= 0 &&
        typeof clip.end === "number" && Number.isFinite(clip.end) && clip.end > clip.start &&
        typeof clip.text === "string" && typeof clip.type === "string" && validMomentTypes.includes(clip.type) &&
        (clip.arcSlot === null || (typeof clip.arcSlot === "string" && validArcSlots.includes(clip.arcSlot))) &&
        typeof clip.locked === "boolean";
    });
}

function downloadFile(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function SabiAgentPanel({ transcript, projectKey, onClose }: {
  transcript: TranscriptSegment[];
  projectKey: string;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const [loadedProjectKey, setLoadedProjectKey] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const previewAwaitingSeek = useRef(false);

  const brief = useSabiAgentStore((state) => state.brief);
  const suggestions = useSabiAgentStore((state) => state.suggestions);
  const storyboard = useSabiAgentStore((state) => state.storyboard);
  const dismissedMomentIds = useSabiAgentStore((state) => state.dismissedMomentIds);
  const chatMessages = useSabiAgentStore((state) => state.chatMessages);
  const isFinding = useSabiAgentStore((state) => state.isFinding);
  const isThinking = useSabiAgentStore((state) => state.isThinking);
  const error = useSabiAgentStore((state) => state.error);
  const previewIndex = useSabiAgentStore((state) => state.previewIndex);
  const history = useSabiAgentStore((state) => state.history);
  const future = useSabiAgentStore((state) => state.future);
  const store = useSabiAgentStore;

  const currentTime = useProjectStore((state) => state.currentTime);
  const mediaPlaying = useProjectStore((state) => state.mediaPlaying);
  const seekTo = useProjectStore((state) => state.seekTo);
  const setHighlightRange = useProjectStore((state) => state.setHighlightRange);
  const pauseMedia = useProjectStore((state) => state.pauseMedia);
  const setActiveTab = useSearchStore((state) => state.setActiveTab);
  const storyboardMomentIds = useMemo(() => storyboard.map((clip) => clip.momentId), [storyboard]);

  const setBrief = useSabiAgentStore((state) => state.setBrief);
  const setPreviewIndex = useSabiAgentStore((state) => state.setPreviewIndex);
  const activePreviewClip = previewIndex === null ? null : storyboard[previewIndex];
  const previewCaption = activePreviewClip
    ? transcript.find((segment) => currentTime >= segment.start && currentTime <= segment.end)?.text ?? activePreviewClip.text
    : "";

  useEffect(() => {
    setLoadedProjectKey(null);
    store.getState().reset();
    try {
      const saved = window.localStorage.getItem(`sabi-agent:${projectKey}`);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!isSavedStoryboard(parsed)) throw new Error("Saved Sabi Agent storyboard data is invalid.");
        store.getState().restore(parsed.brief, parsed.storyboard);
      }
      setStorageError(null);
    } catch (reason) {
      setStorageError(reason instanceof Error ? reason.message : "The Sabi Agent storyboard could not be restored.");
    } finally {
      setLoadedProjectKey(projectKey);
    }
  }, [projectKey, store]);

  useEffect(() => {
    if (loadedProjectKey !== projectKey) return;
    try {
      window.localStorage.setItem(`sabi-agent:${projectKey}`, JSON.stringify({ brief, storyboard }));
      setStorageError(null);
    } catch (reason) {
      setStorageError(reason instanceof Error ? reason.message : "The Sabi Agent storyboard could not be saved.");
    }
  }, [brief, loadedProjectKey, projectKey, storyboard]);

  useEffect(() => {
    if (!isFinding) {
      setLoadingMessageIndex(0);
      return;
    }
    const timer = window.setInterval(() => setLoadingMessageIndex((index) => (index + 1) % loadingMessages.length), 1400);
    return () => window.clearInterval(timer);
  }, [isFinding]);

  const chooseMoment = useCallback((moment: Pick<StoryMoment, "start" | "end">) => {
    setActiveTab("transcript");
    setHighlightRange({ start: moment.start, end: moment.end });
    seekTo(moment.start);
  }, [seekTo, setActiveTab, setHighlightRange]);

  const highlightMoment = useCallback((moment: Pick<StoryMoment, "start" | "end">) => {
    setActiveTab("transcript");
    setHighlightRange({ start: moment.start, end: moment.end });
  }, [setActiveTab, setHighlightRange]);

  const findStory = async () => {
    const state = store.getState();
    state.setFinding(true);
    state.setError(null);
    try {
      const results = await sabiAgentMockService.findMoments({
        brief: state.brief,
        segments: mapTranscriptToStorySegments(transcript),
      });
      state.setSuggestions(results);
      if (!results.length) state.setError("I couldn’t find enough timestamped lines to build a teaser. Try transcribing a longer clip.");
    } catch (reason) {
      state.setError(reason instanceof Error ? reason.message : "Sabi Agent couldn’t read this transcript. Try again.");
    } finally {
      state.setFinding(false);
    }
  };

  const addMoment = (moment: StoryMoment) => {
    const wasEmpty = store.getState().storyboard.length === 0;
    chooseMoment(moment);
    store.getState().addMoment(moment);
    if (wasEmpty) {
      setNotice("First moment added — your teaser is taking shape.");
      window.setTimeout(() => setNotice(""), 3000);
    }
  };

  const playAtIndex = useCallback((index: number) => {
    const clips = store.getState().storyboard;
    if (!clips.length) return;
    const safeIndex = Math.max(0, Math.min(index, clips.length - 1));
    const clip = clips[safeIndex];
    previewAwaitingSeek.current = true;
    setPreviewIndex(safeIndex);
    setHighlightRange({ start: clip.start, end: clip.end });
    setActiveTab("transcript");
    seekTo(clip.start);
  }, [seekTo, setActiveTab, setHighlightRange, setPreviewIndex, store]);

  useEffect(() => {
    if (previewIndex === null || !mediaPlaying) return;
    const clip = storyboard[previewIndex];
    if (!clip) {
      pauseMedia();
      setPreviewIndex(null);
      return;
    }
    if (previewAwaitingSeek.current) {
      if (currentTime >= clip.start && currentTime < clip.end) previewAwaitingSeek.current = false;
      return;
    }
    if (currentTime >= clip.end) {
      if (previewIndex + 1 < storyboard.length) playAtIndex(previewIndex + 1);
      else {
        pauseMedia();
        setPreviewIndex(null);
      }
    }
  }, [currentTime, mediaPlaying, pauseMedia, playAtIndex, previewIndex, setPreviewIndex, storyboard]);

  const startPreview = () => {
    if (previewIndex !== null && !mediaPlaying) playAtIndex(previewIndex);
    else playAtIndex(0);
  };

  const sendMessage = async (text: string) => {
    if (text.toLowerCase().includes("45")) setBrief({ targetLength: 45 });
    store.getState().addChatMessage(createChatMessage("user", text));
    store.getState().setThinking(true);
    try {
      const response = await sabiAgentMockService.reply({
        message: text,
        brief: store.getState().brief,
        moments: store.getState().suggestions,
        storyboard: store.getState().storyboard,
      });
      store.getState().addChatMessage(createChatMessage("assistant", response.text, response.suggestion?.action));
    } catch (reason) {
      store.getState().addChatMessage(createChatMessage("assistant", reason instanceof Error ? reason.message : "I couldn’t make that change just now. Try again."));
    } finally {
      store.getState().setThinking(false);
    }
  };

  const applySuggestion = (message: AgentChatMessage) => {
    const state = store.getState();
    if (message.action === "add-funny") {
      const moment = state.suggestions.find((candidate) => candidate.type === "Funny" || candidate.type === "Punchline");
      if (moment) state.addMoment(moment);
      else {
        setNotice("Run Find my story first so I can add a funny moment.");
        window.setTimeout(() => setNotice(""), 3000);
      }
    } else if (message.action === "move-to-start") {
      const bestClip = state.storyboard
        .map((clip, index) => ({ index, score: state.suggestions.find((moment) => moment.id === clip.momentId)?.strength ?? 0 }))
        .sort((a, b) => b.score - a.score)[0];
      if (bestClip) state.reorderClip(bestClip.index, 0);
    } else if (message.action === "trim-to-target") {
      const target = state.brief.targetLength;
      let remaining = target;
      const trimmed: StoryClip[] = [];
      for (const clip of state.storyboard) {
        const length = clip.end - clip.start;
        if (remaining <= 0) break;
        const kept = Math.min(length, remaining);
        if (kept >= 0.5) trimmed.push({ ...clip, end: clip.start + kept });
        remaining -= kept;
      }
      state.replaceStoryboard(trimmed);
    }
    setNotice("Suggestion applied.");
    window.setTimeout(() => setNotice(""), 2400);
  };

  const trimForTarget = () => {
    const state = store.getState();
    let remaining = state.brief.targetLength;
    const trimmed: StoryClip[] = [];
    for (const clip of state.storyboard) {
      const length = clip.end - clip.start;
      if (remaining <= 0) break;
      const kept = Math.min(length, remaining);
      if (kept >= 0.5) trimmed.push({ ...clip, end: clip.start + kept });
      remaining -= kept;
    }
    state.replaceStoryboard(trimmed);
  };

  const exportTeaser = async (type: ExportType) => {
    const clips = store.getState().storyboard;
    if (type === "copy") {
      try {
        await navigator.clipboard.writeText(formatClipboardCutList(clips));
        setNotice("Cut list copied to clipboard.");
      } catch {
        setNotice("Clipboard access was blocked by the browser. Choose a download format instead.");
      }
      window.setTimeout(() => setNotice(""), 3500);
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    if (type === "json") downloadFile(`sabi-teaser-${date}.json`, exportCutListJson(clips), "application/json");
    else if (type === "srt") downloadFile(`sabi-teaser-${date}.srt`, exportCutListSrt(clips), "text/plain;charset=utf-8");
    else downloadFile(`sabi-teaser-${date}.csv`, exportCutListCsv(clips), "text/csv;charset=utf-8");
    setNotice(`${type.toUpperCase()} export ready.`);
    window.setTimeout(() => setNotice(""), 2500);
  };

  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        pauseMedia();
        setPreviewIndex(null);
        onClose();
        return;
      }
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier) return;
      const target = event.target as HTMLElement | null;
      const isEditingText = target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (event.key.toLowerCase() === "z" && !isEditingText) {
        event.preventDefault();
        if (event.shiftKey) store.getState().redo();
        else store.getState().undo();
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [onClose, pauseMedia, setPreviewIndex, store]);

  useEffect(() => () => {
    if (store.getState().previewIndex !== null) {
      pauseMedia();
      store.getState().setPreviewIndex(null);
    }
  }, [pauseMedia, store]);

  const motionProps = reduceMotion
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: 14 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 14 }, transition: { duration: 0.22, ease: "easeOut" as const } };

  return (
      <motion.aside {...motionProps} id="sabi-agent-panel" className="sabi-agent-panel" role="dialog" aria-modal="false" aria-labelledby="sabi-agent-title">
        <div className="sabi-panel-header">
          <div className="sabi-panel-title"><span className="sabi-agent-avatar"><Sparkles size={15} /></span><div><h2 id="sabi-agent-title">Sabi Agent</h2><p>Your editor’s ear</p></div></div>
          <button type="button" className="sabi-panel-close" aria-label="Close Sabi Agent" onClick={() => { pauseMedia(); setPreviewIndex(null); onClose(); }}><X size={17} /></button>
        </div>
        {storageError && <p className="sabi-storage-notice" role="alert"><AlertCircle size={14} /> {storageError}</p>}
        {loadedProjectKey !== projectKey ? <div className="sabi-panel-loading" role="status">Restoring your storyboard…</div> : (
          <div className="sabi-panel-scroll">
            <StoryBriefForm brief={brief} disabled={!transcript.length} isFinding={isFinding} onChange={setBrief} onFind={() => void findStory()} />
            {isFinding ? (
              <div className="sabi-loading-state" role="status"><span className="sabi-small-spinner" /><b>Reading your transcript</b><p>{loadingMessages[loadingMessageIndex]}</p><div className="sabi-skeleton"><i /><i /><i /></div></div>
            ) : error ? (
              <div className="sabi-error-state" role="alert"><AlertCircle size={18} /><p>{error}</p><button type="button" onClick={() => void findStory()}>Retry</button></div>
            ) : suggestions.length > 0 ? (
              <MomentFinder moments={suggestions} dismissedIds={dismissedMomentIds} storyboardIds={storyboardMomentIds} onAdd={addMoment} onDismiss={(id) => store.getState().dismissMoment(id)} onHighlight={highlightMoment} onPreview={chooseMoment} />
            ) : (
              <div className="sabi-empty-state"><span><Sparkles size={17} /></span><p>Tell me what the story is, and I’ll find the moments.</p><small>Suggestions will be shaped around your goal and tone.</small></div>
            )}
            <Storyboard clips={storyboard} targetLength={brief.targetLength} previewIndex={previewIndex} previewCaption={previewCaption} isPlaying={previewIndex !== null && mediaPlaying} canUndo={history.length > 0} canRedo={future.length > 0}
              onPlay={startPreview} onPause={() => { pauseMedia(); setPreviewIndex(null); }} onRestart={() => playAtIndex(0)} onPrevious={() => playAtIndex((previewIndex ?? 0) - 1)} onNext={() => playAtIndex((previewIndex ?? -1) + 1)}
              onReorder={(from, to) => store.getState().reorderClip(from, to)}
              onNudge={(id, edge, delta, snap) => store.getState().nudgeClip(id, edge, delta, snap, transcript.flatMap((segment) => [segment.start, segment.end]))}
              onSlot={(id, slot: ArcSlot | null) => store.getState().setArcSlot(id, slot)}
              onLock={(id) => store.getState().toggleLock(id)} onDuplicate={(id) => store.getState().duplicateClip(id)} onRemove={(id) => store.getState().removeClip(id)}
              onUndo={() => store.getState().undo()} onRedo={() => store.getState().redo()} onExport={(type) => void exportTeaser(type)} onTrimForMe={trimForTarget} />
            <AgentChat messages={chatMessages} isThinking={isThinking} onSend={(text) => void sendMessage(text)} onApply={applySuggestion} />
            {notice && <p className="sabi-toast" role="status"><Check size={14} /> {notice}</p>}
            {isFinding && <span className="sr-only">{loadingMessages[loadingMessageIndex]}</span>}
          </div>
        )}
        <div className="sabi-mobile-handle" aria-hidden="true"><span /></div>
      </motion.aside>
  );
}
