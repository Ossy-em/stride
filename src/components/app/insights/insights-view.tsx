"use client";

/**
 * Insights: the Focus Fingerprint. Growth, peak hours, focus by day, drift
 * and discoveries, all from the user's own completed sessions. Same on
 * every plan.
 */

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { FocusFingerprintData } from "@/types";
import { useStartSession } from "../start-dialog";
import EmptyState from "../empty-state";
import { DayChart, DriftTrack, HourChart, hourLabel } from "./charts";
import "./insights.css";

export type InsightsData =
  | { kind: "full"; data: FocusFingerprintData }
  | { kind: "forming"; completed: number; needed: number };

const GROWTH_NEEDED = 6;

/* ---------- sections ---------- */

function Section({ title, meta, children }: { title: string; meta?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="app-section">
      <div className="app-section-head">
        <span>{title}</span>
        {meta && <span>{meta}</span>}
      </div>
      {children}
    </section>
  );
}

function Growth({ growth, total }: { growth: FocusFingerprintData["growth"]; total: number }) {
  if (!growth) {
    const left = Math.max(GROWTH_NEEDED - total, 1);
    return (
      <Section title="Your growth">
        <div className="app-list ins-card">
          <p className="ins-note">
            Complete {left} more session{left > 1 ? "s" : ""} to see your growth over time.
          </p>
          <div className="app-progress ins-progress" aria-hidden="true">
            <span style={{ width: `${Math.min(total / GROWTH_NEEDED, 1) * 100}%` }} />
          </div>
        </div>
      </Section>
    );
  }
  const up = growth.improvement > 0;
  const fewerDrifts = growth.recentDrifts < growth.firstWeekDrifts;
  return (
    <Section title="Your growth" meta={up ? <span className="ins-up">+{growth.improvement}%</span> : null}>
      <div className="app-list">
        <div className="app-stats">
          <div className="app-stat">
            <span className="app-stat-label">First sessions</span>
            <span className="app-stat-value">{growth.firstWeekAvg}</span>
            <span className="app-stat-unit">avg focus</span>
          </div>
          <div className="app-stat">
            <span className="app-stat-label">Recent sessions</span>
            <span className="app-stat-value">{growth.recentAvg}</span>
            <span className="app-stat-unit">avg focus</span>
          </div>
          <div className="app-stat">
            <span className="app-stat-label">Distractions per session</span>
            <span className="app-stat-value">
              {growth.firstWeekDrifts} <span className="ins-arrow">→</span> {growth.recentDrifts}
            </span>
            {fewerDrifts && <span className="app-stat-unit">You're getting distracted less often</span>}
          </div>
          <div className="app-stat">
            <span className="app-stat-label">Sessions</span>
            <span className="app-stat-value">{total}</span>
          </div>
        </div>
        <p className="ins-foot">
          {up ? "Your focus is getting stronger. Keep it up!" : "Consistency is key. Every session builds your focus muscle."}
        </p>
      </div>
    </Section>
  );
}

function PeakHours({ peak, hours }: { peak: FocusFingerprintData["peakHours"]; hours: FocusFingerprintData["hourBreakdown"] }) {
  return (
    <Section title="Peak hours" meta={peak && peak.improvement > 0 ? <span className="ins-up">+{peak.improvement}% focus</span> : null}>
      <div className="app-list ins-card">
        {peak ? (
          <div className="ins-headline">
            <strong>
              {hourLabel(peak.start)} – {hourLabel(peak.end)}
            </strong>
            {peak.improvement > 0 && <span>You focus {peak.improvement}% better during this window.</span>}
          </div>
        ) : (
          <p className="ins-note">Complete more sessions to discover your peak focus hours.</p>
        )}
        <HourChart data={hours} peak={peak} />
      </div>
    </Section>
  );
}

function Days({ days }: { days: FocusFingerprintData["dayBreakdown"] }) {
  const active = days.filter((d) => d.sessionCount > 0);
  const best = active.length ? active.reduce((a, b) => (b.avgScore > a.avgScore ? b : a)) : null;
  return (
    <Section title="Focus by day" meta={best ? `Best: ${best.day}s` : null}>
      <div className="app-list ins-card">
        <DayChart data={days} />
      </div>
    </Section>
  );
}

function Drift({ drift }: { drift: FocusFingerprintData["driftPattern"] }) {
  if (!drift) {
    return (
      <Section title="Drift pattern">
        <div className="app-list ins-card">
          <p className="ins-note">Complete more sessions to discover when you typically lose focus.</p>
        </div>
      </Section>
    );
  }
  const rate = drift.interventionSuccess;
  return (
    <Section title="Drift pattern">
      <div className="app-list">
        <div className="ins-card">
          <div className="ins-headline">
            <span className="ins-kicker">You typically drift around</span>
            <strong>{drift.typicalMinute} min</strong>
            <span>This is when your focus tends to waver. We'll check in with you just before.</span>
          </div>
          <DriftTrack minute={drift.typicalMinute} />
        </div>
        <div className="app-row ins-rate">
          <div className="app-row-main">
            <span className="app-row-title">Intervention success rate</span>
            <span className="app-row-sub">
              {rate >= 70
                ? "Great! Nudges are really helping you refocus."
                : rate >= 40
                  ? "Nudges help sometimes. We're learning what works for you."
                  : "You prefer pushing through. We'll adjust our approach."}
            </span>
          </div>
          <span className="ins-rate-value" data-low={rate < 40}>
            {rate}%
          </span>
        </div>
      </div>
    </Section>
  );
}

const DISCOVERY_ICON = { positive: TrendingUp, negative: TrendingDown, neutral: Minus };

function Discoveries({ items }: { items: FocusFingerprintData["discoveries"] }) {
  return (
    <Section title="Discoveries">
      <div className="app-list">
        {items.length === 0 ? (
          <p className="ins-note ins-card">Keep focusing! Patterns will emerge as you complete more sessions.</p>
        ) : (
          items.map((d, i) => {
            const Icon = DISCOVERY_ICON[d.type] ?? Minus;
            return (
              <div className="app-row ins-discovery" key={i} data-tone={d.type === "positive" ? "good" : d.type === "negative" ? "warn" : undefined}>
                <Icon size={16} strokeWidth={1.75} />
                <span className="app-row-main ins-discovery-text">{d.insight}</span>
              </div>
            );
          })
        )}
      </div>
      {items.length > 0 && <p className="ins-caption">Discoveries update as you complete more sessions</p>}
    </Section>
  );
}

/* ---------- page ---------- */

export function InsightsSkeleton() {
  const Bar = ({ w, h = 12, r = 6, style }: { w: number | string; h?: number; r?: number; style?: React.CSSProperties }) => (
    <span className="app-skel" style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />
  );
  return (
    <div className="app-page ins-page" aria-busy="true" aria-label="Loading">
      <Bar w="58%" h={13} style={{ margin: "3px 2px 0" }} />
      <section className="app-section">
        <Bar w={84} h={11} style={{ margin: "0 2px 14px" }} />
        <div className="app-list">
          <div className="app-stats">
            {[0, 1, 2, 3].map((i) => (
              <div className="app-stat" key={i}>
                <Bar w={64} h={10} style={{ margin: "3px 0" }} />
                <Bar w={40} h={22} style={{ marginTop: 9 }} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="app-section">
        <Bar w={72} h={11} style={{ margin: "0 2px 14px" }} />
        <div className="app-list ins-card">
          <Bar w={140} h={22} />
          <Bar w="52%" h={12} style={{ marginTop: 10 }} />
          <div className="ins-skel-cols">
            {[30, 42, 55, 70, 64, 48, 36, 40, 52, 46, 34, 28, 38, 50, 44, 30, 22, 18].map((h, i) => (
              <span key={i} className="app-skel" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </section>
      <section className="app-section">
        <Bar w={88} h={11} style={{ margin: "0 2px 14px" }} />
        <div className="app-list ins-card">
          {[78, 64, 70, 52, 60, 34, 40].map((w, i) => (
            <Bar key={i} w={`${w}%`} h={10} style={{ marginTop: i ? 14 : 0 }} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function InsightsView({ state }: { state: InsightsData }) {
  const { openStart } = useStartSession();

  if (state.kind === "forming") {
    const left = Math.max(state.needed - state.completed, 1);
    return (
      <EmptyState
        title="Your Focus Fingerprint is forming"
        description={`Complete ${left} more focus session${left > 1 ? "s" : ""} to unlock personalized insights about how you focus.`}
        action={
          <div className="ins-forming">
            <div className="app-progress" aria-hidden="true">
              <span style={{ width: `${(state.completed / state.needed) * 100}%` }} />
            </div>
            <span>
              {state.completed} of {state.needed} sessions
            </span>
            <button className="app-cta" onClick={() => openStart()}>
              Start session
            </button>
          </div>
        }
      />
    );
  }

  const d = state.data;
  const total = d.dayBreakdown.reduce((n, x) => n + x.sessionCount, 0);
  return (
    <div className="app-page ins-page">
      <p className="ins-lead">Patterns and insights based on your focus sessions. Updated as you complete more.</p>
      <Growth growth={d.growth} total={total} />
      <PeakHours peak={d.peakHours} hours={d.hourBreakdown} />
      <Days days={d.dayBreakdown} />
      <Drift drift={d.driftPattern} />
      <Discoveries items={d.discoveries} />
      <div className="ins-end">
        <p>The more you focus, the smarter these insights become.</p>
        <button className="app-cta" onClick={() => openStart()}>
          Start session
        </button>
      </div>
    </div>
  );
}
