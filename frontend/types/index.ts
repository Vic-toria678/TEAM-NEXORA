export type LanguageCode = "eng" | "yor" | "ibo" | "hau" | "pcm";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface SearchResult extends TranscriptSegment {
  score: number;
  id: number;
}

export type TranscriptionStatus = "idle" | "processing" | "success" | "error";
