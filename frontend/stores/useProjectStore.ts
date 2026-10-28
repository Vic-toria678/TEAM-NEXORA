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
  hasHydrated: boolean;
  persistenceError: string | null;
  resumeAfterReload: boolean;
  setFile: (file: File | null) => void;
  setLanguage: (language: LanguageCode) => void;
  setStatus: (status: TranscriptionStatus) => void;
  setError: (error: string | null) => void;
  setTranscript: (transcript: TranscriptSegment[]) => void;
  updateSegment: (index: number, text: string) => void;
  setCurrentTime: (time: number) => void;
  seekTo: (time: number) => void;
  restoreWorkspace: (workspace: {
    file: File;
    language: LanguageCode;
    transcript: TranscriptSegment[];
    currentTime: number;
    isTranscribing: boolean;
  }) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setPersistenceError: (error: string | null) => void;
  clearResumeAfterReload: () => void;
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
  hasHydrated: false,
  persistenceError: null,
  resumeAfterReload: false,
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
      resumeAfterReload: false,
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
  restoreWorkspace: (workspace) => {
    const previousUrl = get().mediaUrl;
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    set({
      file: workspace.file,
      mediaUrl: URL.createObjectURL(workspace.file),
      language: workspace.language,
      transcript: workspace.transcript,
      currentTime: workspace.currentTime,
      seekTime: null,
      status: workspace.isTranscribing ? "processing" : workspace.transcript.length ? "success" : "idle",
      resumeAfterReload: workspace.isTranscribing,
      error: null,
    });
  },
  setHasHydrated: (hasHydrated) => set({ hasHydrated }),
  setPersistenceError: (persistenceError) => set({ persistenceError }),
  clearResumeAfterReload: () => set({ resumeAfterReload: false }),
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
      persistenceError: null,
      resumeAfterReload: false,
    });
  },
}));
