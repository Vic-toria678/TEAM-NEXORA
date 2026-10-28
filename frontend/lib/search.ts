import type { SearchResult, TranscriptSegment } from "@/types";

const STOP_WORDS = new Set(["a", "an", "and", "at", "for", "i", "in", "is", "it", "of", "on", "the", "to", "we"]);

function terms(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

export async function searchTranscript(
  query: string,
  transcript: TranscriptSegment[],
): Promise<SearchResult[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const queryTerms = terms(query);
  if (!queryTerms.length) return [];

  return transcript
    .map((segment, id) => {
      const textTerms = new Set(terms(segment.text));
      const matched = queryTerms.filter((term) =>
        [...textTerms].some((text) => text.includes(term) || term.includes(text)),
      );
      return {
        ...segment,
        id,
        score: matched.length / queryTerms.length,
      };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.start - b.start);
}
