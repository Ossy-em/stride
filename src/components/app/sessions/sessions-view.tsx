"use client";

/**
 * Sessions: your focus history. Summary numbers for the range, then every
 * session grouped by day. Rows open to show the details; a session still
 * running links back to the timer.
 */

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CalendarRange, ChevronRight, Code, Layers, PenLine, type LucideIcon } from "lucide-react";
import type { SessionHistoryItem, SessionHistoryResponse } from "@/types";
import PageHeader from "../page-header";
import ChipMenu from "../chip-menu";
import EmptyState from "../empty-state";
import { useStartSession } from "../start-dialog";

export type Range = SessionHistoryResponse["range"];

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

const TYPES: Record<string, { label: string; Icon: LucideIcon }> = {
  writing: { label: "Writing", Icon: PenLine },
  reading: { label: "Learning", Icon: BookOpen },
  coding: { label: "Development", Icon: Code },
};
const typeOf = (t: string) => TYPES[t] ?? { label: t, Icon: Layers };

const minutes = (m: number) => {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};
const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function dayLabel(d: Date) {
  const today = new Date();
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(today) - start(d)) / 864e5);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
  });
}

function groupByDay(list: SessionHistoryItem[]) {
  const groups: { key: string; label: string; items: SessionHistoryItem[] }[] = [];
  for (const s of list) {
    const d = new Date(s.startedAt);
    const key = d.toDateString();
    const g = groups.at(-1);
    if (g && g.key === key) g.items.push(s);
    else groups.push({ key, label: dayLabel(d), items: [s] });
  }
  return groups;
}

function SessionRow({ s }: { s: SessionHistoryItem }) {
  const [open, setOpen] = useState(false);
  const { label, Icon } = typeOf(s.taskType);
  const sub = [label, time(s.startedAt), s.nudges ? `${s.nudges} nudge${s.nudges > 1 ? "s" : ""}` : null]
    .filter(Boolean)
    .join(" · ");

  if (s.status === "in_progress") {
    return (
      <Link href={`/session/active?id=${s.id}`} className="app-row">
        <Icon size={16} strokeWidth={1.75} />
        <div className="app-row-main">
          <span className="app-row-title sess-title">{s.task}</span>
          <span className="app-row-sub">{sub}</span>
        </div>
        <span className="sess-live">
          <span className="dot" />
          In progress
        </span>
        <ChevronRight className="app-row-chevron" size={16} strokeWidth={1.75} />
      </Link>
    );
  }

  return (
    <div className="sess-item" data-open={open}>
      <button className="app-row sess-row" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon size={16} strokeWidth={1.75} />
        <div className="app-row-main">
          <span className="app-row-title sess-title">{s.task}</span>
          <span className="app-row-sub">{sub}</span>
        </div>
        <span className="sess-meta">
          {s.status === "completed" ? (
            <>
              {s.actualMinutes !== null && <span>{minutes(s.actualMinutes)}</span>}
              {s.focusQuality !== null && (
                <span className="sess-score" data-low={s.focusQuality < 5}>
                  {s.focusQuality}/10
                </span>
              )}
            </>
          ) : (
            <span className="sess-unsaved">Not saved</span>
          )}
        </span>
        <ChevronRight className="app-row-chevron sess-chevron" size={16} strokeWidth={1.75} />
      </button>

      {open && (
        <div className="sess-detail">
          <dl className="sess-facts">
            <div>
              <dt>Planned</dt>
              <dd>{minutes(s.plannedMinutes)}</dd>
            </div>
            <div>
              <dt>Focused</dt>
              <dd>{s.actualMinutes !== null ? minutes(s.actualMinutes) : "–"}</dd>
            </div>
            <div>
              <dt>Distractions</dt>
              <dd>{s.distractions ?? "–"}</dd>
            </div>
            <div>
              <dt>Nudges</dt>
              <dd>{s.nudges ? `${s.nudgesAccepted} of ${s.nudges} accepted` : "None"}</dd>
            </div>
          </dl>
          {s.outcome && (
            <dl className="sess-outcome">
              <dt>What you got done</dt>
              <dd>{s.outcome}</dd>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}

export function SessionsSkeleton() {
  const Bar = ({ w, h = 12, r = 6, style }: { w: number | string; h?: number; r?: number; style?: React.CSSProperties }) => (
    <span className="app-skel" style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />
  );
  return (
    <div className="app-page sess-page" aria-busy="true" aria-label="Loading">
      <div className="app-list">
        <div className="app-stats">
          {[0, 1, 2, 3].map((i) => (
            <div className="app-stat" key={i}>
              <Bar w={52} h={10} style={{ margin: "3px 0" }} />
              <Bar w={48} h={22} style={{ marginTop: 9 }} />
            </div>
          ))}
        </div>
      </div>
      {[3, 2].map((n, g) => (
        <section className="app-section" key={g}>
          <Bar w={64} h={11} style={{ margin: "0 2px 14px" }} />
          <div className="app-list">
            {Array.from({ length: n }, (_, i) => (
              <div className="app-row" key={i}>
                <Bar w={16} h={16} r={999} />
                <div className="app-row-main">
                  <Bar w={`${46 - i * 8}%`} h={13} style={{ margin: "3px 0" }} />
                  <Bar w="30%" h={11} style={{ marginTop: 7 }} />
                </div>
                <Bar w={72} h={20} r={999} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function SessionsView({
  data,
  range,
  onRange,
  loading,
  error,
  onRetry,
}: {
  data: SessionHistoryResponse | null;
  range: Range;
  onRange: (r: Range) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const { openStart } = useStartSession();
  const list = data?.sessions ?? [];
  const done = list.filter((s) => s.status === "completed");
  const focusMinutes = done.reduce((t, s) => t + (s.actualMinutes || 0), 0);
  const scored = done.filter((s) => s.focusQuality !== null);
  const avg = scored.length ? scored.reduce((t, s) => t + (s.focusQuality || 0), 0) / scored.length : null;
  const nudges = list.reduce((t, s) => t + s.nudges, 0);

  return (
    <>
      <PageHeader
        title="Sessions"
        actions={
          <ChipMenu
            icon={CalendarRange}
            label={RANGE_OPTIONS.find((o) => o.value === range)!.label}
            ariaLabel="Date range"
            options={RANGE_OPTIONS}
            value={range}
            onChange={onRange}
            align="right"
          />
        }
      />
      <div className="app-scroll">
        {error ? (
          <EmptyState
            title="Couldn't load your sessions"
            description="Something went wrong. Please try again."
            action={
              <button className="app-ghost-btn" onClick={onRetry}>
                Try again
              </button>
            }
          />
        ) : loading || !data ? (
          <SessionsSkeleton />
        ) : list.length === 0 ? (
          <EmptyState
            title={range === "all" ? "No sessions yet" : "No sessions in this range"}
            description={
              range === "all"
                ? "Start a session from Home and it will show up here."
                : "Nothing in this range. Try a longer one, or start a session from Home."
            }
            action={
              <button className="app-cta" onClick={() => openStart()}>
                Start session
              </button>
            }
          />
        ) : (
          <div className="app-page sess-page">
            <div className="app-list">
              <div className="app-stats">
                <div className="app-stat">
                  <span className="app-stat-label">Sessions</span>
                  <span className="app-stat-value">{done.length}</span>
                </div>
                <div className="app-stat">
                  <span className="app-stat-label">Focus time</span>
                  <span className="app-stat-value">{minutes(focusMinutes)}</span>
                </div>
                <div className="app-stat">
                  <span className="app-stat-label">Avg. focus</span>
                  <span className="app-stat-value">{avg !== null ? `${avg.toFixed(1)}/10` : "–"}</span>
                </div>
                <div className="app-stat">
                  <span className="app-stat-label">Nudges</span>
                  <span className="app-stat-value">{nudges}</span>
                </div>
              </div>
            </div>

            {groupByDay(list).map((g) => (
              <section className="app-section" key={g.key}>
                <div className="app-section-head">
                  <span>{g.label}</span>
                  <span>{minutes(g.items.reduce((t, s) => t + (s.actualMinutes || 0), 0))}</span>
                </div>
                <div className="app-list">
                  {g.items.map((s) => (
                    <SessionRow key={s.id} s={s} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
