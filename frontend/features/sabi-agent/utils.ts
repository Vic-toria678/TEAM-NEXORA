import { formatSrtTime } from "@/lib/utils";
import type { TranscriptSegment } from "@/types";
import type { StoryClip, StoryMoment, StorySegment } from "./types";

export function mapTranscriptToStorySegments(transcript: TranscriptSegment[]): StorySegment[] {
  return transcript.map((segment, sourceIndex) => ({
    ...segment,
    id: `${segment.start.toFixed(3)}-${sourceIndex}`,
    sourceIndex,
  }));
}

export function formatTimecode(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function reorderItems<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function trimClip(
  clip: StoryClip,
  edge: "start" | "end",
  delta: number,
  snapToCaptions = false,
  captionBoundaries: number[] = [],
): StoryClip {
  const step = Math.round(delta * 2) / 2;
  if (edge === "start") {
    const raw = Math.max(0, Math.min(clip.start + step, clip.end - 0.5));
    const candidates = captionBoundaries.filter((point) =>
      point >= 0 && point <= clip.end - 0.5 && (step > 0 ? point > clip.start : point < clip.start),
    );
    const snapped = snapToCaptions
      ? candidates.filter((point) => step > 0 ? point >= raw : point <= raw).sort((a, b) => step > 0 ? a - b : b - a)[0]
      : undefined;
    const start = snapped ?? raw;
    return { ...clip, start };
  }
  const raw = Math.max(clip.start + 0.5, clip.end + step);
  const candidates = captionBoundaries.filter((point) =>
    point >= clip.start + 0.5 && (step > 0 ? point > clip.end : point < clip.end),
  );
  const snapped = snapToCaptions
    ? candidates.filter((point) => step > 0 ? point >= raw : point <= raw).sort((a, b) => step > 0 ? a - b : b - a)[0]
    : undefined;
  const end = snapped ?? raw;
  return { ...clip, end };
}

export function totalDuration(clips: StoryClip[]): number {
  return clips.reduce((total, clip) => total + Math.max(0, clip.end - clip.start), 0);
}

export function exportCutListJson(clips: StoryClip[]): string {
  return JSON.stringify(clips.map((clip, index) => ({
    order: index + 1,
    sourceIn: clip.start,
    sourceOut: clip.end,
    duration: Math.max(0, clip.end - clip.start),
    type: clip.type,
    arcSlot: clip.arcSlot,
    text: clip.text,
  })), null, 2);
}

export function exportCutListCsv(clips: StoryClip[]): string {
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return [
    "order,source_in,source_out,duration,type,arc_slot,caption",
    ...clips.map((clip, index) => [
      String(index + 1),
      formatTimecode(clip.start),
      formatTimecode(clip.end),
      (clip.end - clip.start).toFixed(2),
      quote(clip.type),
      quote(clip.arcSlot ?? ""),
      quote(clip.text),
    ].join(",")),
  ].join("\n");
}

export function exportCutListSrt(clips: StoryClip[]): string {
  let elapsed = 0;
  return clips.map((clip, index) => {
    const duration = Math.max(0, clip.end - clip.start);
    const entry = `${index + 1}\n${formatSrtTime(elapsed)} --> ${formatSrtTime(elapsed + duration)}\n${clip.text.trim()}`;
    elapsed += duration;
    return entry;
  }).join("\n\n");
}

export function formatClipboardCutList(clips: StoryClip[]): string {
  return clips.map((clip, index) =>
    `${index + 1}. ${formatTimecode(clip.start)}–${formatTimecode(clip.end)} (${formatTimecode(clip.end - clip.start)}) · ${clip.type} — ${clip.text}`,
  ).join("\n");
}

export function momentToClip(moment: StoryMoment): StoryClip {
  return {
    id: `${moment.id}-clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    momentId: moment.id,
    start: moment.start,
    end: moment.end,
    text: moment.text,
    type: moment.type,
    arcSlot: null,
    locked: false,
  };
}
