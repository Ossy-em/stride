"use client";

/**
 * Goals on Home: this week's focus against the weekly target, and the next
 * goals coming up. Loads on its own so Home never waits on it.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Flag, Target } from "lucide-react";
import type { GoalsResponse } from "@/types";
import { hours, minutes, shortDate, todayYmd } from "../goals/format";

const ICON = { size: 16, strokeWidth: 1.75 } as const;

export function HomeGoalsView({ data }: { data: GoalsResponse }) {
  const { week } = data;
  const next = data.goals
    .filter((g) => g.status === "active")
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2);
  const today = todayYmd();

  if (!week.targetMinutes && !next.length) {
    return (
      <section className="app-section">
        <div className="app-section-head">Goals</div>
        <div className="app-list">
          <Link href="/goals" className="app-row">
            <Target {...ICON} />
            <div className="app-row-main">
              <span className="app-row-title">Set a weekly target or add a goal</span>
            </div>
            <ChevronRight className="app-row-chevron" size={16} strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    );
  }

  const pct = week.targetMinutes ? Math.min(week.minutes / week.targetMinutes, 1) : 0;
  return (
    <section className="app-section">
      <div className="app-section-head">
        <span>Goals</span>
        <Link href="/goals" className="app-hide-sm">
          See all goals
        </Link>
      </div>
      <div className="app-list">
        {week.targetMinutes ? (
          <Link href="/goals" className="app-row">
            <Target {...ICON} />
            <div className="home-fp">
              <span className="app-row-title">This week</span>
              <span className="app-row-sub">
                {minutes(week.minutes)} of {hours(week.targetMinutes)}
              </span>
              <div className="app-progress home-goal-bar" aria-hidden="true">
                <span style={{ width: `${pct * 100}%` }} />
              </div>
            </div>
            <span className="app-row-meta">{Math.round(pct * 100)}%</span>
            <ChevronRight className="app-row-chevron" size={16} strokeWidth={1.75} />
          </Link>
        ) : null}
        {next.map((g) => {
          const overdue = !!g.dueDate && g.dueDate < today;
          const sub = [
            g.targetMinutes ? `${minutes(g.minutes)} of ${hours(g.targetMinutes)}` : g.minutes ? minutes(g.minutes) : null,
            g.stepsTotal ? `${g.stepsDone} of ${g.stepsTotal} steps` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <Link href={`/goals/${g.id}`} className="app-row" key={g.id}>
              <Flag {...ICON} />
              <div className="app-row-main">
                <span className="app-row-title">{g.title}</span>
                {sub && <span className="app-row-sub">{sub}</span>}
              </div>
              {g.dueDate && (
                <span className="app-row-meta" style={overdue ? { color: "var(--app-warn)" } : undefined}>
                  Due {shortDate(g.dueDate)}
                </span>
              )}
              <ChevronRight className="app-row-chevron" size={16} strokeWidth={1.75} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function HomeGoals() {
  const [data, setData] = useState<GoalsResponse | null>(null);
  useEffect(() => {
    let live = true;
    const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
    fetch(`/api/goals?tz=${tz}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => live && d && setData(d))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  // nothing until it loads (or if goals aren't set up): Home stays as it was
  return data ? <HomeGoalsView data={data} /> : null;
}
