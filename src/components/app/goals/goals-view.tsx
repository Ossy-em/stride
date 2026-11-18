"use client";

/**
 * Goals: a weekly focus-hours target, plus named goals that sessions are
 * linked to when you start them. Goals are dated (due date, or the day they
 * were added), grouped by month, and ticked off like a checklist.
 */

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Target } from "lucide-react";
import type { Goal, GoalsResponse } from "@/types";
import PageHeader from "../page-header";
import ChipMenu from "../chip-menu";
import EmptyState from "../empty-state";
import GoalDialog, { type GoalInput } from "./goal-dialog";
import { hours, minutes, shortDate, todayYmd } from "./format";
import "./goals.css";

export type GoalActions = {
  create: (input: GoalInput) => Promise<void>;
  update: (id: string, patch: { status: Goal["status"] }) => Promise<void>;
  setWeekly: (targetMinutes: number | null) => Promise<void>;
};

const WEEKLY = [0, 5, 10, 15, 20, 25, 30, 40].map((h) => ({ value: h * 60, label: h ? `${h}h a week` : "No target" }));
const DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Week({ week, onTarget }: { week: GoalsResponse["week"]; onTarget: (m: number | null) => void }) {
  const [custom, setCustom] = useState("");
  const target = week.targetMinutes;
  const pct = target ? Math.min(week.minutes / target, 1) : 0;
  const max = Math.max(...week.days.map((d) => d.minutes), target ? target / 5 : 60, 1);
  const today = todayYmd();
  const options = WEEKLY.some((o) => o.value === (target ?? 0))
    ? WEEKLY
    : [...WEEKLY, { value: target!, label: `${hours(target!)} a week` }].sort((a, b) => a.value - b.value);

  return (
    <section className="app-section goals-first">
      <div className="app-section-head">
        <span>This week</span>
        <ChipMenu
          icon={Target}
          label={target ? `${hours(target)} target` : "Set a target"}
          ariaLabel="Weekly target"
          options={options}
          value={target ?? 0}
          onChange={(v) => onTarget(v || null)}
          align="right"
          footer={(close) => (
            <label className="home-custom">
              Custom
              <input
                type="number"
                min={1}
                max={100}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const n = parseFloat(custom);
                    if (!isNaN(n) && n > 0) onTarget(Math.round(Math.min(n, 100) * 60));
                    close();
                  }
                }}
              />
              h
            </label>
          )}
        />
      </div>
      <div className="app-list goals-week">
        <div className="goals-week-top">
          <div className="goals-week-num">
            <strong>{minutes(week.minutes)}</strong>
            {target ? <span>of {hours(target)}</span> : <span>focused</span>}
          </div>
          <span className="goals-week-meta">
            {week.sessions} session{week.sessions === 1 ? "" : "s"}
            {target ? ` · ${Math.round(pct * 100)}%` : ""}
          </span>
        </div>
        {target ? (
          <div className="app-progress goals-progress" aria-hidden="true">
            <span style={{ width: `${pct * 100}%` }} />
          </div>
        ) : null}
        <div className="goals-days" role="img" aria-label="Focus time by day this week">
          {week.days.map((d, i) => (
            <div key={d.date} className="goals-day" data-today={d.date === today} data-future={d.date > today}>
              <div className="goals-day-plot" title={`${DAY[i]}: ${d.minutes ? minutes(d.minutes) : "no focus time"}`}>
                {d.minutes > 0 ? (
                  <span className="goals-day-bar" style={{ height: `${Math.max((d.minutes / max) * 100, 6)}%` }} />
                ) : (
                  <span className="goals-day-empty" />
                )}
              </div>
              <span className="goals-day-label">{DAY[i]}</span>
              <span className="goals-day-value">{d.minutes ? minutes(d.minutes) : ""}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A goal's date: its due date, or the day it was added. Groups goals by month. */
const goalDate = (g: Goal) => g.dueDate ?? g.createdAt.slice(0, 10);
const monthKey = (ymd: string) => ymd.slice(0, 7);
const monthLabel = (key: string) => {
  const d = new Date(`${key}-01T00:00:00`);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString([], { month: "long", ...(sameYear ? {} : { year: "numeric" }) });
};

function groupByMonth(goals: Goal[]) {
  const groups = new Map<string, Goal[]>();
  for (const g of goals) {
    const k = monthKey(goalDate(g));
    groups.set(k, [...(groups.get(k) ?? []), g]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({
      key,
      label: monthLabel(key),
      // open goals first (soonest date on top), done ones at the bottom
      items: items.sort((a, b) =>
        a.status !== b.status ? (a.status === "active" ? -1 : 1) : goalDate(a).localeCompare(goalDate(b))
      ),
    }));
}

function GoalRow({ g, onToggle }: { g: Goal; onToggle: () => void }) {
  const done = g.status === "completed";
  const pct = g.targetMinutes ? Math.min(g.minutes / g.targetMinutes, 1) : null;
  const overdue = !done && !!g.dueDate && g.dueDate < todayYmd();
  const sub = [
    g.targetMinutes ? `${minutes(g.minutes)} of ${hours(g.targetMinutes)}` : g.minutes ? minutes(g.minutes) : "No sessions yet",
    g.stepsTotal ? `${g.stepsDone} of ${g.stepsTotal} steps` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const date = done && g.completedAt ? `Done ${shortDate(g.completedAt.slice(0, 10))}` : g.dueDate ? `Due ${shortDate(g.dueDate)}` : shortDate(goalDate(g));

  return (
    <div className="app-row goal-row" data-done={done}>
      <button
        className="goal-check"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Mark "${g.title}" as not done` : `Mark "${g.title}" as done`}
        onClick={onToggle}
      >
        <Check size={12} strokeWidth={2.5} />
      </button>
      <Link className="goal-open" href={`/goals/${g.id}`}>
        <span className="app-row-main">
          <span className="app-row-title goal-title">{g.title}</span>
          <span className="app-row-sub">{sub}</span>
          {pct !== null && !done && (
            <span className="app-progress goal-bar" aria-hidden="true">
              <span style={{ width: `${pct * 100}%` }} />
            </span>
          )}
        </span>
        <span className="app-row-meta goal-meta">
          {pct !== null && !done && <span className="goal-pct">{Math.round(pct * 100)}%</span>}
          <span data-tone={overdue ? "warn" : undefined}>{date}</span>
        </span>
        <ChevronRight className="app-row-chevron" size={16} strokeWidth={1.75} />
      </Link>
    </div>
  );
}

export function GoalsSkeleton() {
  const Bar = ({ w, h = 12, r = 6, style }: { w: number | string; h?: number; r?: number; style?: React.CSSProperties }) => (
    <span className="app-skel" style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />
  );
  return (
    <div className="app-page goals-page" aria-busy="true" aria-label="Loading">
      <section className="app-section goals-first">
        <Bar w={72} h={11} style={{ margin: "0 2px 14px" }} />
        <div className="app-list goals-week">
          <Bar w={120} h={24} />
          <Bar w="100%" h={3} style={{ marginTop: 16 }} />
          <div className="goals-days">
            {[40, 70, 20, 85, 55, 0, 0].map((h, i) => (
              <div className="goals-day" key={i}>
                <div className="goals-day-plot">{h > 0 && <span className="app-skel goals-day-bar" style={{ height: `${h}%` }} />}</div>
                <Bar w={24} h={10} style={{ margin: "8px auto 0" }} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="app-section">
        <Bar w={48} h={11} style={{ margin: "0 2px 14px" }} />
        <div className="app-list">
          {[0, 1, 2].map((i) => (
            <div className="app-row" key={i}>
              <Bar w={16} h={16} r={999} />
              <div className="app-row-main">
                <Bar w={`${50 - i * 10}%`} h={13} style={{ margin: "3px 0" }} />
                <Bar w="30%" h={11} style={{ marginTop: 7 }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function GoalsView({
  data,
  error,
  onRetry,
  actions,
}: {
  data: GoalsResponse | null;
  error?: boolean;
  onRetry?: () => void;
  actions: GoalActions;
}) {
  // editing happens on each goal's own page; here we only create
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="Goals"
        actions={
          data ? (
            <button className="app-cta goals-new" onClick={() => setCreating(true)}>
              New goal
            </button>
          ) : null
        }
      />
      <div className="app-scroll">
        {error ? (
          <EmptyState
            title="Couldn't load your goals"
            description="Something went wrong. Please try again."
            action={
              <button className="app-ghost-btn" onClick={onRetry}>
                Try again
              </button>
            }
          />
        ) : !data ? (
          <GoalsSkeleton />
        ) : (
          <div className="app-page goals-page">
            <Week week={data.week} onTarget={actions.setWeekly} />

            {data.goals.length === 0 ? (
              <section className="app-section">
                <div className="app-section-head">
                  <span>Goals</span>
                </div>
                <div className="app-list goals-none">
                  <p>No goals yet. Pick one when you start a session and your focus time counts towards it.</p>
                  <button className="app-ghost-btn" onClick={() => setCreating(true)}>
                    New goal
                  </button>
                </div>
              </section>
            ) : (
              groupByMonth(data.goals).map((m) => {
                const open = m.items.filter((g) => g.status === "active").length;
                return (
                  <section className="app-section" key={m.key}>
                    <div className="app-section-head">
                      <span>{m.label}</span>
                      <span>
                        {m.items.length - open} of {m.items.length} done
                      </span>
                    </div>
                    <div className="app-list">
                      {m.items.map((g) => (
                        <GoalRow
                          key={g.id}
                          g={g}
                          onToggle={() => actions.update(g.id, { status: g.status === "completed" ? "active" : "completed" })}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {creating && <GoalDialog goal={null} onClose={() => setCreating(false)} onSave={actions.create} />}
      </AnimatePresence>
    </>
  );
}
