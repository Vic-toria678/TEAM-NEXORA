import { describe, expect, it } from "vitest";
import type { StoryClip } from "./types";
import { exportCutListCsv, exportCutListJson, exportCutListSrt, formatTimecode, reorderItems, trimClip } from "./utils";

const clip: StoryClip = {
  id: "clip-1",
  momentId: "moment-1",
  start: 10,
  end: 20,
  text: "A useful line",
  type: "Insight",
  arcSlot: "Setup",
  locked: false,
};

describe("Sabi Agent editing helpers", () => {
  it("formats timecodes with hours only when needed", () => {
    expect(formatTimecode(65.9)).toBe("01:05");
    expect(formatTimecode(3661)).toBe("01:01:01");
  });

  it("reorders a clip without mutating the original array", () => {
    const source = ["first", "second", "third"];
    expect(reorderItems(source, 0, 2)).toEqual(["second", "third", "first"]);
    expect(source).toEqual(["first", "second", "third"]);
    expect(reorderItems(source, -1, 1)).toBe(source);
  });

  it("trims in half-second increments and prevents invalid clip lengths", () => {
    expect(trimClip(clip, "start", -50).start).toBe(0);
    expect(trimClip(clip, "start", 20).start).toBe(19.5);
    expect(trimClip(clip, "end", -50).end).toBe(10.5);
    expect(trimClip(clip, "end", 0.6).end).toBe(20.5);
  });

  it("snaps trims to caption boundaries when enabled", () => {
    expect(trimClip(clip, "start", 0.5, true, [12, 14]).start).toBe(12);
    expect(trimClip(clip, "start", -0.5, true, [8, 10]).start).toBe(8);
    expect(trimClip(clip, "end", 0.5, true, [20, 22]).end).toBe(22);
    expect(trimClip(clip, "end", -0.5, true, [18, 20]).end).toBe(18);
    expect(trimClip(clip, "start", 0.5, false, [12]).start).toBe(10.5);
  });
});

describe("Sabi Agent exporters", () => {
  it("exports JSON and CSV cut lists with source timecodes", () => {
    expect(JSON.parse(exportCutListJson([clip]))).toEqual([expect.objectContaining({
      order: 1,
      sourceIn: 10,
      sourceOut: 20,
      duration: 10,
    })]);
    expect(exportCutListCsv([clip])).toContain('1,00:10,00:20,10.00,"Insight","Setup","A useful line"');
  });

  it("rebases teaser SRT captions to start at zero", () => {
    const second = { ...clip, id: "clip-2", start: 50, end: 53, text: "Final thought" };
    expect(exportCutListSrt([clip, second])).toBe(
      "1\n00:00:00,000 --> 00:00:10,000\nA useful line\n\n2\n00:00:10,000 --> 00:00:13,000\nFinal thought",
    );
  });
});
