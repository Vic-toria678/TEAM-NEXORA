import { create } from "zustand";
import type { LanguageCode, TranscriptSegment, TranscriptionStatus } from "@/types";

interface ProjectState {
  file: File | null;
  mediaUrl: string | null;
  language: LanguageCode;
  transcript: TranscriptSegment[];
  status: TranscriptionStatus;
  error: string | null;
  currentTime: number;
  seekTime: number | null;
  setFile: (file: File | null) => void;
  setLanguage: (language: LanguageCode) => void;
  setStatus: (status: TranscriptionStatus) => void;
  setError: (error: string | null) => void;
  setTranscript: (transcript: TranscriptSegment[]) => void;
  updateSegment: (index: number, text: string) => void;
  setCurrentTime: (time: number) => void;
  seekTo: (time: number) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  file: null,
  mediaUrl: null,
  language: "eng",
  transcript: [],
  status: "idle",
  error: null,
  currentTime: 0,
  seekTime: null,
  setFile: (file) => {
    const previousUrl = get().mediaUrl;
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    set({
      file,
      mediaUrl: file ? URL.createObjectURL(file) : null,
      transcript: [],
      status: "idle",
      error: null,
      currentTime: 0,
      seekTime: null,
    });
  },
  setLanguage: (language) => set({ language }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setTranscript: (transcript) => set({ transcript, status: "success", error: null }),
  updateSegment: (index, text) =>
    set((state) => ({
      transcript: state.transcript.map((segment, segmentIndex) =>
        segmentIndex === index ? { ...segment, text } : segment,
      ),
    })),
  setCurrentTime: (currentTime) => set({ currentTime }),
  seekTo: (seekTime) => set({ seekTime }),
  clearProject: () => {
    const mediaUrl = get().mediaUrl;
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    set({
      file: null,
      mediaUrl: null,
      transcript: [],
      status: "idle",
      error: null,
      currentTime: 0,
      seekTime: null,
    });
  },
}));
