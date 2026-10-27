export type Language = string; // a code from GET /api/languages, or 'auto'
export interface LanguageOption { code: string; label: string }
export type ClipStatus = 'queued' | 'processing' | 'ready' | 'failed';
export type Stage = 'loading_model' | 'transcribing' | 'indexing';

export interface Segment {
  start: number;
  end: number;
  text: string;
  lowConfidenceWords: string[];
  baselineText?: string;
}
export interface Clip {
  id: string;
  name: string;
  durationSec: number;
  status: ClipStatus;
  stage: Stage | null;
  progress: number;
  error?: string | null;
}
export interface ClipDetail extends Clip {
  segments: Segment[];
}
export interface SearchHit {
  clipId: string;
  clipName: string;
  segmentIndex: number;
  start: number;
  end: number;
  text: string;
  matchType: 'exact' | 'semantic';
  score: number;
}
