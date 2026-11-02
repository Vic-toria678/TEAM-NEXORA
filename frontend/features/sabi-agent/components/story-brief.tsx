"use client";

import { Search, Sparkles } from "lucide-react";
import type { StoryBrief, StoryPlatform, StoryTone } from "../types";

const tones: StoryTone[] = ["Funny", "Emotional", "Hype", "Inspiring", "Controversial", "Educational"];
const platforms: Array<{ name: StoryPlatform; length: number }> = [
  { name: "Instagram Reel", length: 60 },
  { name: "TikTok", length: 60 },
  { name: "YouTube Shorts", length: 60 },
  { name: "X / Twitter", length: 45 },
  { name: "YouTube Trailer", length: 90 },
];
const pacingHints: Record<StoryPlatform, string> = {
  "Instagram Reel": "Lead with a visual or bold line; land the payoff quickly.",
  TikTok: "Open with a curiosity gap, then keep the beats moving.",
  "YouTube Shorts": "Set context fast and end on a clear takeaway.",
  "X / Twitter": "Keep one strong point and a compact, quotable close.",
  "YouTube Trailer": "Give the story room to build toward a satisfying turn.",
};

export function StoryBriefForm({
  brief,
  disabled,
  isFinding,
  onChange,
  onFind,
}: {
  brief: StoryBrief;
  disabled: boolean;
  isFinding: boolean;
  onChange: (brief: Partial<StoryBrief>) => void;
  onFind: () => void;
}) {
  return (
    <form className="sabi-brief" onSubmit={(event) => { event.preventDefault(); onFind(); }}>
      <div className="sabi-section-label">STORY BRIEF</div>
      <label className="sabi-field-label" htmlFor="sabi-platform">Made for</label>
      <select id="sabi-platform" className="sabi-select" value={brief.platform} onChange={(event) => {
        const platform = event.target.value as StoryPlatform;
        const preset = platforms.find((item) => item.name === platform);
        onChange({ platform, ...(preset ? { targetLength: preset.length } : {}) });
      }}>
        {platforms.map(({ name }) => <option key={name}>{name}</option>)}
      </select>

      <label className="sabi-field-label" htmlFor="sabi-length">Target length</label>
      <div className="sabi-length-row">
        <select id="sabi-length" className="sabi-select" value={[30, 60, 90].includes(brief.targetLength) ? brief.targetLength : "custom"} onChange={(event) => {
          onChange({ targetLength: event.target.value === "custom" ? 45 : Number(event.target.value) });
        }}>
          <option value={30}>30 seconds</option>
          <option value={60}>60 seconds</option>
          <option value={90}>90 seconds</option>
          <option value="custom">Custom</option>
        </select>
        {![30, 60, 90].includes(brief.targetLength) && (
          <input className="sabi-custom-length" aria-label="Custom target length in seconds" type="number" min={5} max={600} value={brief.targetLength} onChange={(event) => onChange({ targetLength: Math.max(5, Number(event.target.value) || 5) })} />
        )}
      </div>

      <span className="sabi-field-label">Tone</span>
      <div className="sabi-chip-row" aria-label="Select story tones">
        {tones.map((tone) => (
          <button key={tone} type="button" className={`sabi-chip ${brief.tone.includes(tone) ? "sabi-chip-selected" : ""}`} aria-pressed={brief.tone.includes(tone)} onClick={() => onChange({ tone: brief.tone.includes(tone) ? brief.tone.filter((item) => item !== tone) : [...brief.tone, tone] })}>{tone}</button>
        ))}
      </div>

      <label className="sabi-field-label" htmlFor="sabi-about">What’s this teaser about? <span>Optional</span></label>
      <textarea id="sabi-about" className="sabi-about" rows={2} maxLength={240} placeholder="A founder’s unexpected first year…" value={brief.about} onChange={(event) => onChange({ about: event.target.value })} />
      <button className="button button-primary sabi-find-button" type="submit" disabled={disabled || isFinding}>
        {isFinding ? <><span className="sabi-small-spinner" /> Reading your transcript…</> : <><Sparkles size={15} /> Find my story</>}
      </button>
      {!disabled && <p className="sabi-brief-hint"><Search size={12} /> {pacingHints[brief.platform]}</p>}
    </form>
  );
}
