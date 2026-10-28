import type { LanguageCode, TranscriptSegment } from "@/types";

export async function transcribeMedia(
  file: File,
  language: LanguageCode,
): Promise<TranscriptSegment[]> {
  const body = new FormData();
  body.append("file", file);
  body.append("language", language);

  const response = await fetch("/api/transcribe", { method: "POST", body });
  if (!response.ok) {
    let message = `Transcription failed (${response.status}).`;
    try {
      const error = (await response.json()) as { detail?: string };
      if (error.detail) message = error.detail;
    } catch {
      // Keep the HTTP error message when the server response is not JSON.
    }
    throw new Error(message);
  }

  const data: unknown = await response.json();
  if (
    !Array.isArray(data) ||
    !data.every(
      (item): item is TranscriptSegment =>
        typeof item === "object" &&
        item !== null &&
        "start" in item &&
        "end" in item &&
        "text" in item &&
        typeof item.start === "number" &&
        typeof item.end === "number" &&
        typeof item.text === "string",
    )
  ) {
    throw new Error("The transcription server returned an unexpected response.");
  }
  return data;
}
