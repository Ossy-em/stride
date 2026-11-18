"use client";

/**
 * Weekly review on Home: last week's numbers and the Agent's short summary.
 * Shows all week; closing it hides it until next week's review.
 * Loads on its own so Home never waits on it (the summary can take a moment
 * the first time it's written each week).
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { WeeklyReview } from "@/lib/weekly";
import "./home-weekly.css";

const HIDE_KEY = "stride-weekly-hidden";

const minutes = (m: number) => {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};

const range = (a: string, b: string) => {
  const d = (s: string) => new Date(`${s}T12:00:00Z`);
  const month = (s: string) => d(s).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const day = (s: string) => d(s).getUTCDate();
  return month(a) === month(b) ? `${month(a)} ${day(a)} to ${day(b)}` : `${month(a)} ${day(a)} to ${month(b)} ${day(b)}`;
};

export function HomeWeeklyView({ review, onClose }: { review: WeeklyReview; onClose?: () => void }) {
  const { stats, summary } = review;
  const diff = stats.minutes - stats.prevMinutes;

  return (
    <section className="app-section home-week">
      <div className="app-section-head">
        <span>
          Last week <span className="home-week-range">{range(stats.weekStart, stats.weekEnd)}</span>
        </span>
        {onClose && (
          <button className="app-icon-btn home-week-close" onClick={onClose} aria-label="Hide until next week">
            <X size={14} strokeWidth={1.75} />
          </button>
        )}
      </div>
      <div className="app-list">
        {summary && <p className="home-week-summary">{summary}</p>}
        <div className="app-stats">
          <div className="app-stat">
            <span className="app-stat-label">Sessions</span>
            <span className="app-stat-value">{stats.sessions}</span>
            <span className="app-stat-unit">
              {stats.activeDays} day{stats.activeDays !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="app-stat">
            <span className="app-stat-label">Focus time</span>
            <span className="app-stat-value">{minutes(stats.minutes)}</span>
            <span className="app-stat-unit" data-tone={diff > 0 ? "up" : undefined}>
              {stats.prevSessions === 0
                ? ""
                : diff === 0
                  ? "same as week before"
                  : `${diff > 0 ? "+" : "-"}${minutes(Math.abs(diff))} vs week before`}
            </span>
          </div>
          <div className="app-stat">
            <span className="app-stat-label">Avg focus</span>
            <span className="app-stat-value">{stats.avgRating ?? "-"}</span>
            <span className="app-stat-unit">out of 10</span>
          </div>
          {stats.bestDay && (
            <div className="app-stat">
              <span className="app-stat-label">Best day</span>
              <span className="app-stat-value">{stats.bestDay.day.slice(0, 3)}</span>
              <span className="app-stat-unit">{minutes(stats.bestDay.minutes)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function HomeWeekly() {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [hidden, setHidden] = useState(true); // stay hidden until we know

  useEffect(() => {
    let alive = true;
    const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
    fetch(`/api/weekly-review?tz=${tz}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.review) return;
        let hiddenFor: string | null = null;
        try {
          hiddenFor = localStorage.getItem(HIDE_KEY);
        } catch {}
        setReview(d.review);
        setHidden(hiddenFor === d.review.stats.weekStart);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!review || hidden) return null;

  const close = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDE_KEY, review.stats.weekStart);
    } catch {}
  };

  return <HomeWeeklyView review={review} onClose={close} />;
}
