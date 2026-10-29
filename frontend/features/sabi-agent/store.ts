import { create } from "zustand";
import { momentToClip, reorderItems, trimClip } from "./utils";
import type { AgentChatMessage, ArcSlot, StoryBrief, StoryClip, StoryMoment } from "./types";

interface Snapshot {
  storyboard: StoryClip[];
}

interface SabiAgentState {
  brief: StoryBrief;
  suggestions: StoryMoment[];
  storyboard: StoryClip[];
  dismissedMomentIds: string[];
  chatMessages: AgentChatMessage[];
  isFinding: boolean;
  isThinking: boolean;
  error: string | null;
  previewIndex: number | null;
  history: Snapshot[];
  future: Snapshot[];
  setBrief: (brief: Partial<StoryBrief>) => void;
  setSuggestions: (suggestions: StoryMoment[]) => void;
  setFinding: (isFinding: boolean) => void;
  setThinking: (isThinking: boolean) => void;
  setError: (error: string | null) => void;
  addMoment: (moment: StoryMoment) => void;
  dismissMoment: (id: string) => void;
  removeClip: (id: string) => void;
  duplicateClip: (id: string) => void;
  reorderClip: (from: number, to: number) => void;
  nudgeClip: (id: string, edge: "start" | "end", delta: number, snap: boolean, boundaries: number[]) => void;
  setArcSlot: (id: string, slot: ArcSlot | null) => void;
  toggleLock: (id: string) => void;
  replaceStoryboard: (storyboard: StoryClip[]) => void;
  addChatMessage: (message: AgentChatMessage) => void;
  setPreviewIndex: (index: number | null) => void;
  undo: () => void;
  redo: () => void;
  restore: (brief: StoryBrief, storyboard: StoryClip[]) => void;
  reset: () => void;
}

const initialBrief: StoryBrief = { targetLength: 60, tone: [], platform: "Instagram Reel", about: "" };
const newMessage = (role: AgentChatMessage["role"], text: string, action?: AgentChatMessage["action"]): AgentChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
  action,
});

export const useSabiAgentStore = create<SabiAgentState>((set, get) => {
  const updateStoryboard = (update: (storyboard: StoryClip[]) => StoryClip[]) => {
    const current = get().storyboard;
    const next = update(current);
    if (next === current) return;
    set((state) => ({
      storyboard: next,
      history: [...state.history, { storyboard: current }].slice(-30),
      future: [],
    }));
  };

  return {
    brief: initialBrief,
    suggestions: [],
    storyboard: [],
    dismissedMomentIds: [],
    chatMessages: [newMessage("assistant", "Tell me what the story is, and I’ll find the moments.")],
    isFinding: false,
    isThinking: false,
    error: null,
    previewIndex: null,
    history: [],
    future: [],
    setBrief: (brief) => set((state) => ({ brief: { ...state.brief, ...brief } })),
    setSuggestions: (suggestions) => set({ suggestions, dismissedMomentIds: [], error: null }),
    setFinding: (isFinding) => set({ isFinding }),
    setThinking: (isThinking) => set({ isThinking }),
    setError: (error) => set({ error }),
    addMoment: (moment) => {
      if (get().storyboard.some((clip) => clip.momentId === moment.id)) return;
      updateStoryboard((clips) => [...clips, momentToClip(moment)]);
    },
    dismissMoment: (id) => set((state) => ({ dismissedMomentIds: [...state.dismissedMomentIds, id] })),
    removeClip: (id) => updateStoryboard((clips) => clips.filter((clip) => clip.id !== id)),
    duplicateClip: (id) => updateStoryboard((clips) => {
      const index = clips.findIndex((clip) => clip.id === id);
      if (index < 0) return clips;
      const clip = clips[index];
      const copy = { ...clip, id: `${clip.id}-copy-${Date.now()}`, locked: false };
      return [...clips.slice(0, index + 1), copy, ...clips.slice(index + 1)];
    }),
    reorderClip: (from, to) => updateStoryboard((clips) => {
      if (clips[from]?.locked || clips[to]?.locked) return clips;
      return reorderItems(clips, from, to);
    }),
    nudgeClip: (id, edge, delta, snap, boundaries) => updateStoryboard((clips) => clips.map((clip) =>
      clip.id === id && !clip.locked ? trimClip(clip, edge, delta, snap, boundaries) : clip,
    )),
    setArcSlot: (id, arcSlot) => updateStoryboard((clips) => clips.map((clip) =>
      clip.id === id && !clip.locked ? { ...clip, arcSlot } : clip,
    )),
    toggleLock: (id) => updateStoryboard((clips) => clips.map((clip) =>
      clip.id === id ? { ...clip, locked: !clip.locked } : clip,
    )),
    replaceStoryboard: (storyboard) => updateStoryboard(() => storyboard),
    addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
    setPreviewIndex: (previewIndex) => set({ previewIndex }),
    undo: () => set((state) => {
      const previous = state.history.at(-1);
      if (!previous) return state;
      return {
        storyboard: previous.storyboard,
        history: state.history.slice(0, -1),
        future: [...state.future, { storyboard: state.storyboard }],
      };
    }),
    redo: () => set((state) => {
      const next = state.future.at(-1);
      if (!next) return state;
      return {
        storyboard: next.storyboard,
        history: [...state.history, { storyboard: state.storyboard }],
        future: state.future.slice(0, -1),
      };
    }),
    restore: (brief, storyboard) => set({
      brief,
      suggestions: [],
      storyboard,
      dismissedMomentIds: [],
      chatMessages: [newMessage("assistant", "Tell me what the story is, and I’ll find the moments.")],
      isFinding: false,
      isThinking: false,
      error: null,
      previewIndex: null,
      history: [],
      future: [],
    }),
    reset: () => set({
      brief: initialBrief,
      suggestions: [],
      storyboard: [],
      dismissedMomentIds: [],
      chatMessages: [newMessage("assistant", "Tell me what the story is, and I’ll find the moments.")],
      isFinding: false,
      isThinking: false,
      error: null,
      previewIndex: null,
      history: [],
      future: [],
    }),
  };
});

export function createChatMessage(role: AgentChatMessage["role"], text: string, action?: AgentChatMessage["action"]): AgentChatMessage {
  return newMessage(role, text, action);
}
