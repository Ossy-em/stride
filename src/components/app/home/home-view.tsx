"use client";

/**
 * Home: greet, start a session, see today at a glance, jump into insights.
 * Presentational; data comes from /api/home via ./home.tsx.
 */

import Link from "next/link";
import { ChevronRight, Flame, FingerprintPattern, Sparkle, TriangleAlert, Trophy } from "lucide-react";
import type { HomeResponse } from "@/types";
import PageHeader from "../page-header";
import StartCard from "./start-card";
import HomeGoals from "./home-goals";
import HomeWeekly from "./home-weekly";

const GREETING = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Hey there",
} as const;

const minutes = (m: number) => {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};
const hourLabel = (h: number) => (h === 0 ? "12am" : h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`);
const ICON = { size: 16, strokeWidth: 1.75 } as const;

function StreakRow({ current, longest, isAtRisk }: HomeResponse["streak"]) {
  if (current === 0 && longest === 0) return null;
  const toRecord = longest - current;

  if (isAtRisk && current > 0) {
    return (
      <div className="app-row" data-tone="warn">
        <TriangleAlert {...ICON} />
        <div className="app-row-main">
          <span className="app-row-title">{current}-day streak at risk!</span>
          <span className="app-row-sub">Complete a session today to keep it going.</span>
        </div>
      </div>
    );
  }
  if (current > 0 && current >= longest) {
    return (
      <div className="app-row" data-tone="good">
        <Trophy {...ICON} />
        <div className="app-row-main">
          <span className="app-row-title">{current}-day streak, your best ever!</span>
          <span className="app-row-sub">You&apos;re setting new records. Keep it up!</span>
        </div>
      </div>
    );
  }
  if (current > 0) {
    return (
      <div className="app-row" data-tone="good">
        <Flame {...ICON} />
        <div className="app-row-main">
          <span className="app-row-title">{current}-day streak</span>
          {toRecord > 0 && toRecord <= 3 && (
            <span className="app-row-sub">
              {toRecord === 1
                ? `Just 1 more day to beat your record of ${longest}!`
                : `${toRecord} more days to beat your record of ${longest}.`}
            </span>
          )}
        </div>
        {toRecord > 3 && <span className="app-row-meta">Your longest: {longest} days</span>}
      </div>
    );
  }
  return (
    <div className="app-row">
      <Flame {...ICON} />
      <div className="app-row-main">
        <span className="app-row-title">Start a new streak</span>
        <span className="app-row-sub">Your best was {longest} days. You can beat it!</span>
      </div>
    </div>
  );
}

function FingerprintRow({ patterns, total }: { patterns: HomeResponse["patterns"]; total: number }) {
  const NEEDED = 5;
  if (total < NEEDED) {
    const left = NEEDED - total;
    return (
      <Link href="/insights" className="app-row">
        <FingerprintPattern {...ICON} />
        <div className="home-fp">
          <span className="app-row-title">Your Focus Fingerprint</span>
          <span className="app-row-sub">
            Complete {left} more session{left > 1 ? "s" : ""} to unlock personalized patterns and insights about how you focus.
          </span>
          <div className="app-progress" aria-hidden="true">
            <span style={{ width: `${(total / NEEDED) * 100}%` }} />
          </div>
        </div>
        <span className="app-row-meta">
          {total}/{NEEDED} sessions
        </span>
      </Link>
    );
  }

  const bits = [
    patterns.peakHours && `Peak: ${hourLabel(patterns.peakHours.start)}-${hourLabel(patterns.peakHours.end)}`,
    patterns.bestDay && `Best day: ${patterns.bestDay.day}s`,
  ].filter(Boolean);

  return (
    <Link href="/insights" className="app-row">
      <FingerprintPattern {...ICON} />
      <div className="app-row-main">
        <span className="app-row-title">Your Focus Fingerprint</span>
        {bits.length > 0 && <span className="app-row-sub">{bits.join(" · ")}</span>}
      </div>
      <span className="app-row-meta app-hide-sm">See all patterns</span>
      <ChevronRight className="app-row-chevron" size={16} strokeWidth={1.75} />
    </Link>
  );
}

export default function HomeView({ data, firstName }: { data: HomeResponse; firstName?: string | null }) {
  const name = data.user.firstName || firstName;
  const active = data.today.sessions > 0 || data.week.sessions > 0;

  return (
    <>
      <PageHeader title="Home" />
      <div className="app-scroll">
        <p className="home-greet">
          {GREETING[data.greeting.timeOfDay]}
          {name && `, ${name}`}
        </p>
        <div className="app-page home-page">
          <h2 className="home-title">{data.greeting.message}</h2>
          {data.greeting.subMessage && <p className="home-sub">{data.greeting.subMessage}</p>}

          <StartCard
            suggestedDuration={data.patterns.suggestedDuration}
            peakHours={data.patterns.peakHours}
            sessionsToday={data.today.sessions}
          />

          <HomeWeekly />

          {active && (
            <section className="app-section">
              <div className="app-section-head">Activity</div>
              <div className="app-list">
                <div className="app-stats">
                  <div className="app-stat">
                    <span className="app-stat-label">Today</span>
                    <span className="app-stat-value">{data.today.sessions}</span>
                    <span className="app-stat-unit">session{data.today.sessions !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="app-stat">
                    <span className="app-stat-label">Today</span>
                    <span className="app-stat-value">{minutes(data.today.focusMinutes)}</span>
                    <span className="app-stat-unit">focus time</span>
                  </div>
                  <div className="app-stat">
                    <span className="app-stat-label">This week</span>
                    <span className="app-stat-value">{data.week.sessions}</span>
                    <span className="app-stat-unit">session{data.week.sessions !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="app-stat">
                    <span className="app-stat-label">This week</span>
                    <span className="app-stat-value">{minutes(data.week.focusMinutes)}</span>
                    <span className="app-stat-unit">focus time</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <HomeGoals />

          <section className="app-section">
            <div className="app-section-head">Focus</div>
            <div className="app-list">
              <StreakRow {...data.streak} />
              <FingerprintRow patterns={data.patterns} total={data.records.totalSessions} />
              {data.insights.length > 0 && !data.isNewUser && (
                <div className="app-row">
                  <Sparkle {...ICON} />
                  <div className="app-row-main">
                    <span className="app-row-title">Insight</span>
                    <span className="app-row-sub">{data.insights[0]}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
