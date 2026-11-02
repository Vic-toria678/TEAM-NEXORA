import type { AgentReplyRequest, SabiAgentService, StoryMoment, StorySearchRequest } from "./types";

const momentProfiles: Array<Pick<StoryMoment, "type" | "why" | "strength">> = [
  { type: "Hook", why: "A bold opening line gives the teaser an immediate point of view.", strength: 5 },
  { type: "Funny", why: "The everyday detail makes the punchline easy to picture.", strength: 4 },
  { type: "Insight", why: "A practical idea lands clearly without extra context.", strength: 4 },
  { type: "Punchline", why: "The surprise at the end gives this beat a clean payoff.", strength: 5 },
  { type: "Story Beat", why: "This detail sets up the story in a relatable way.", strength: 3 },
  { type: "Insight", why: "A concise takeaway gives the audience something to keep.", strength: 4 },
  { type: "Emotional", why: "The personal detail adds warmth and stakes to the story.", strength: 5 },
  { type: "Emotional", why: "This honest reflection creates a memorable emotional turn.", strength: 4 },
  { type: "Insight", why: "A useful principle comes through in one strong sentence.", strength: 4 },
  { type: "Funny", why: "The playful image is a natural, culturally grounded laugh.", strength: 4 },
  { type: "Hot Take", why: "A clear disagreement invites a response from viewers.", strength: 4 },
  { type: "Punchline", why: "The unexpected phrasing is short, quotable, and distinctive.", strength: 5 },
  { type: "Cliffhanger", why: "The turnaround creates momentum and makes viewers want the next beat.", strength: 4 },
  { type: "Story Beat", why: "The reflection helps the story resolve with purpose.", strength: 3 },
  { type: "Story Beat", why: "This is a confident final thought that can close the teaser.", strength: 5 },
];

const replyFor = (message: string, request: AgentReplyRequest) => {
  const normalized = message.toLowerCase();
  if (normalized.includes("funny") || normalized.includes("punch")) {
    const moment = request.moments.find((item) => item.type === "Funny" || item.type === "Punchline");
    return {
      text: moment
        ? `I found a sharper laugh at ${Math.floor(moment.start / 60)}:${String(Math.floor(moment.start % 60)).padStart(2, "0")}. It has a nice setup-payoff rhythm.`
        : "I’d keep the strongest specific detail and cut the explanation around it. That’s where the laugh usually lands.",
      suggestion: moment ? { text: "Add this funny beat", action: "add-funny" as const } : undefined,
    };
  }
  if (normalized.includes("45") || normalized.includes("trim")) {
    return { text: "Let’s keep the strongest beats and make room for a clean ending.", suggestion: { text: "Trim the teaser to your target", action: "trim-to-target" as const } };
  }
  if (normalized.includes("start") || normalized.includes("hook") || normalized.includes("controversy") || normalized.includes("suspense")) {
    return request.storyboard.length
      ? { text: "Your strongest opening should earn attention before the setup. I’d lead with the first clip for now.", suggestion: { text: "Move the first clip to the opening", action: "move-to-start" as const } }
      : { text: "Let’s find a strong opening first, then build the story around it.", suggestion: undefined };
  }
  return { text: "I’d keep the clearest moment, then let the next clip add context. Want me to shape the pacing around your target length?", suggestion: undefined };
};

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export const sabiAgentMockService: SabiAgentService = {
  async findMoments({ brief, segments }: StorySearchRequest) {
    await pause(800);
    const tonePreference = brief.tone[0];
    const selected = segments.length <= 15
      ? segments
      : Array.from({ length: 15 }, (_, index) => segments[Math.round(index * (segments.length - 1) / 14)]);

    return selected.map((segment, index) => {
      const profile = momentProfiles[index % momentProfiles.length];
      const duration = Math.max(1, segment.end - segment.start);
      return {
        ...segment,
        end: Math.max(segment.end, segment.start + Math.max(1, Math.min(duration, 16))),
        type: tonePreference === "Funny" && index % 4 === 1 ? "Funny" : profile.type,
        why: profile.why,
        strength: profile.strength,
      };
    });
  },
  async reply(request) {
    await pause(680);
    return replyFor(request.message, request);
  },
};
