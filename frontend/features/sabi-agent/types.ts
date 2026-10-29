import type { TranscriptSegment } from "@/types";

export type StoryTone = "Funny" | "Emotional" | "Hype" | "Inspiring" | "Controversial" | "Educational";
export type StoryPlatform = "Instagram Reel" | "TikTok" | "YouTube Shorts" | "X / Twitter" | "YouTube Trailer";
export type MomentType = "Hook" | "Funny" | "Emotional" | "Insight" | "Hot Take" | "Punchline" | "Cliffhanger" | "Story Beat";
export type ArcSlot = "Hook" | "Setup" | "Tension" | "Payoff" | "Closer";

export interface StoryBrief {
  targetLength: number;
  tone: StoryTone[];
  platform: StoryPlatform;
  about: string;
}

export interface StorySegment extends TranscriptSegment {
  id: string;
  sourceIndex: number;
}

export interface StoryMoment extends StorySegment {
  type: MomentType;
  why: string;
  strength: 1 | 2 | 3 | 4 | 5;
}

export interface StoryClip {
  id: string;
  momentId: string;
  start: number;
  end: number;
  text: string;
  type: MomentType;
  arcSlot: ArcSlot | null;
  locked: boolean;
}

export interface AgentChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  action?: "move-to-start" | "add-funny" | "trim-to-target";
}

export interface AgentSuggestion {
  text: string;
  action: "move-to-start" | "add-funny" | "trim-to-target";
}

export interface StorySearchRequest {
  brief: StoryBrief;
  segments: StorySegment[];
}

export interface AgentReplyRequest {
  message: string;
  brief: StoryBrief;
  moments: StoryMoment[];
  storyboard: StoryClip[];
}

export interface SabiAgentService {
  findMoments(request: StorySearchRequest): Promise<StoryMoment[]>;
  reply(request: AgentReplyRequest): Promise<{ text: string; suggestion?: AgentSuggestion }>;
}
