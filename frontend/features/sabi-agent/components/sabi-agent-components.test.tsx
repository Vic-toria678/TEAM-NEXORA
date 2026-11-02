import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentChat } from "./agent-chat";
import { MomentFinder } from "./moment-finder";
import { StoryBriefForm } from "./story-brief";
import { Storyboard } from "./storyboard";
import type { AgentChatMessage, StoryBrief, StoryClip, StoryMoment } from "../types";

afterEach(cleanup);

const brief: StoryBrief = { targetLength: 60, tone: [], platform: "Instagram Reel", about: "" };
const moment: StoryMoment = {
  id: "moment-1",
  sourceIndex: 0,
  start: 65,
  end: 72,
  text: "A funny, memorable line.",
  type: "Funny",
  why: "The detail makes the punchline easy to picture.",
  strength: 5,
};
const clips: StoryClip[] = [
  { id: "clip-1", momentId: "moment-1", start: 65, end: 72, text: moment.text, type: "Funny", arcSlot: null, locked: false },
  { id: "clip-2", momentId: "moment-2", start: 90, end: 98, text: "A helpful insight.", type: "Insight", arcSlot: null, locked: false },
];

const storyboardProps = (overrides: Partial<React.ComponentProps<typeof Storyboard>> = {}): React.ComponentProps<typeof Storyboard> => ({
  clips,
  targetLength: 60,
  previewIndex: null,
  previewCaption: "",
  isPlaying: false,
  canUndo: false,
  canRedo: false,
  onPlay: vi.fn(),
  onPause: vi.fn(),
  onRestart: vi.fn(),
  onPrevious: vi.fn(),
  onNext: vi.fn(),
  onReorder: vi.fn(),
  onNudge: vi.fn(),
  onSlot: vi.fn(),
  onLock: vi.fn(),
  onDuplicate: vi.fn(),
  onRemove: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  onExport: vi.fn(),
  onTrimForMe: vi.fn(),
  ...overrides,
});

describe("Sabi Agent components", () => {
  it("submits a brief with selected tones and target length", () => {
    const onChange = vi.fn();
    const onFind = vi.fn();
    render(<StoryBriefForm brief={brief} disabled={false} isFinding={false} onChange={onChange} onFind={onFind} />);

    fireEvent.click(screen.getByRole("button", { name: "Funny" }));
    fireEvent.change(screen.getByLabelText("Target length"), { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: "Find my story" }));

    expect(onChange).toHaveBeenCalledWith({ tone: ["Funny"] });
    expect(onChange).toHaveBeenCalledWith({ targetLength: 30 });
    expect(onFind).toHaveBeenCalledOnce();
  });

  it("previews, adds, and dismisses a suggested moment", () => {
    const onPreview = vi.fn();
    const onAdd = vi.fn();
    const onDismiss = vi.fn();
    render(<MomentFinder moments={[moment]} dismissedIds={[]} storyboardIds={[]} onPreview={onPreview} onAdd={onAdd} onDismiss={onDismiss} onHighlight={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Preview moment at 01:05" }));
    fireEvent.click(screen.getByRole("button", { name: "Add to storyboard" }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss moment" }));

    expect(onPreview).toHaveBeenCalledWith(moment);
    expect(onAdd).toHaveBeenCalledWith(moment);
    expect(onDismiss).toHaveBeenCalledWith(moment.id);
  });

  it("supports keyboard reorder, teaser preview, and export actions", () => {
    const props = storyboardProps();
    render(<Storyboard {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Move clip 2 up" }));
    fireEvent.click(screen.getByRole("button", { name: "Play teaser" }));
    fireEvent.click(screen.getByRole("button", { name: "Restart teaser" }));
    fireEvent.click(screen.getByRole("button", { name: /Export/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Download JSON" }));

    expect(props.onReorder).toHaveBeenCalledWith(1, 0);
    expect(props.onPlay).toHaveBeenCalledOnce();
    expect(props.onRestart).toHaveBeenCalledOnce();
    expect(props.onExport).toHaveBeenCalledWith("json");
  });

  it("offers caption-snapped trims and supports precise free trimming", () => {
    const props = storyboardProps();
    render(<Storyboard {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Caption snap on/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Trim clip start later by 0.5 seconds" })[0]);

    expect(props.onNudge).toHaveBeenCalledWith("clip-1", "start", 0.5, false);
  });

  it("sends a chat message and exposes an actionable assistant suggestion", () => {
    const onSend = vi.fn();
    const onApply = vi.fn();
    const messages: AgentChatMessage[] = [{
      id: "reply-1",
      role: "assistant",
      text: "I found a stronger opening.",
      action: "move-to-start",
    }];
    render(<AgentChat messages={messages} isThinking={false} onSend={onSend} onApply={onApply} />);

    fireEvent.change(screen.getByLabelText("Message Sabi Agent"), { target: { value: "Find a stronger hook" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply suggestion" }));

    expect(onSend).toHaveBeenCalledWith("Find a stronger hook");
    expect(onApply).toHaveBeenCalledWith(messages[0]);
  });
});
