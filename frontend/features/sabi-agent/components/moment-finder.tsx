"use client";

import { Check, Eye, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { formatTimecode } from "../utils";
import type { MomentType, StoryMoment } from "../types";

const momentTypes: MomentType[] = ["Hook", "Funny", "Emotional", "Insight", "Hot Take", "Punchline", "Cliffhanger", "Story Beat"];

export function MomentFinder({
  moments,
  dismissedIds,
  storyboardIds,
  onAdd,
  onDismiss,
  onHighlight,
  onPreview,
}: {
  moments: StoryMoment[];
  dismissedIds: string[];
  storyboardIds: string[];
  onAdd: (moment: StoryMoment) => void;
  onDismiss: (id: string) => void;
  onHighlight: (moment: StoryMoment) => void;
  onPreview: (moment: StoryMoment) => void;
}) {
  const [filter, setFilter] = useState<MomentType | "All">("All");
  const [sort, setSort] = useState<"strength" | "timeline">("strength");
  const [expanded, setExpanded] = useState<string[]>([]);
  const visibleMoments = useMemo(() => moments
    .filter((moment) => !dismissedIds.includes(moment.id) && (filter === "All" || moment.type === filter))
    .sort((a, b) => sort === "strength" ? b.strength - a.strength || a.start - b.start : a.start - b.start), [moments, dismissedIds, filter, sort]);

  return (
    <section className="sabi-moments" aria-labelledby="sabi-moments-heading">
      <div className="sabi-subhead">
        <div><h3 id="sabi-moments-heading">Suggested moments</h3><span>{visibleMoments.length} to shape</span></div>
        <select aria-label="Sort suggested moments" className="sabi-sort" value={sort} onChange={(event) => setSort(event.target.value as "strength" | "timeline")}>
          <option value="strength">Strongest</option><option value="timeline">Timeline</option>
        </select>
      </div>
      <div className="sabi-filter-row" aria-label="Filter moments by type">
        {(["All", ...momentTypes] as const).map((type) => <button key={type} type="button" className={`sabi-filter ${filter === type ? "sabi-filter-active" : ""}`} aria-pressed={filter === type} onClick={() => setFilter(type)}>{type}</button>)}
      </div>
      <div className="sabi-moment-list" role="list" aria-label="Suggested story moments">
        {visibleMoments.map((moment, index) => {
          const isExpanded = expanded.includes(moment.id);
          const added = storyboardIds.includes(moment.id);
          return (
            <article key={moment.id} role="listitem" className="sabi-moment-card" style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }} onMouseEnter={() => onHighlight(moment)}>
              <div className="sabi-moment-meta">
                <span className={`sabi-type-tag sabi-type-${moment.type.toLowerCase().replace(" ", "-")}`}>{moment.type}</span>
                <span className="sabi-timecode">{formatTimecode(moment.start)}–{formatTimecode(moment.end)}</span>
              </div>
              <button type="button" className="sabi-excerpt" aria-expanded={isExpanded} onFocus={() => onHighlight(moment)} onClick={() => setExpanded((values) => isExpanded ? values.filter((id) => id !== moment.id) : [...values, moment.id])}>{isExpanded ? moment.text : moment.text.length > 150 ? `${moment.text.slice(0, 150)}…` : moment.text}</button>
              <p className="sabi-why"><span>Sabi Agent</span> {moment.why}</p>
              <div className="sabi-card-foot">
                <span className="sabi-strength" aria-label={`Strength ${moment.strength} out of 5`}>{Array.from({ length: 5 }, (_, dot) => <i key={dot} className={dot < moment.strength ? "sabi-strength-on" : ""} />)}<span>{moment.strength}/5</span></span>
                <div className="sabi-card-actions">
                  <button type="button" aria-label={`Preview moment at ${formatTimecode(moment.start)}`} title="Preview moment" onClick={() => onPreview(moment)}><Eye size={14} /></button>
                  <button type="button" aria-label={added ? "Already on storyboard" : "Add to storyboard"} title={added ? "Added" : "Add to storyboard"} disabled={added} onClick={() => onAdd(moment)}>{added ? <Check size={14} /> : <Plus size={14} />}</button>
                  <button type="button" aria-label="Dismiss moment" title="Dismiss" onClick={() => onDismiss(moment.id)}><X size={14} /></button>
                </div>
              </div>
            </article>
          );
        })}
        {!visibleMoments.length && <p className="sabi-empty-inline">No moments in this filter. Try another type.</p>}
      </div>
    </section>
  );
}
