"use client";

import type { CSSProperties } from "react";
import { MessageCircle, ThumbsUp, Minus, ThumbsDown } from "lucide-react";

/**
 * Stride product screens — coded mockups, not screenshots.
 *
 * Each screen is built in a container-query space, so every value scales
 * with the tile it sits in. Sizes are authored against a nominal 320px
 * phone width: 1cqw ≈ 3.2px at that width.
 *
 * These now mirror the real product layout (ActiveTimer, InterventionNotification,
 * CheckInModal) rather than an earlier design target — icon avatar, gradient
 * timer arc, solid End-session button, and the icon-square mood picker all
 * match what actually ships.
 */

const SessionScreen = () => (
  <div className="mk mk--session">
    <div className="mk-status">
      <span className="mk-dot" />
      <span>Focus session</span>
    </div>

    <div className="mk-ring">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="mk-ring-track" cx="50" cy="50" r="42" />
        <circle
          className="mk-ring-arc"
          cx="50"
          cy="50"
          r="42"
          strokeDasharray="263.9"
          strokeDashoffset="184"
          stroke="url(#mkTimerGradient)"
        />
        <defs>
          <linearGradient id="mkTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10221c" />
            <stop offset="100%" stopColor="#7c9389" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mk-ring-inner">
        <span className="mk-time">03:46</span>
        <span className="mk-remaining">11:14 remaining</span>
      </div>
    </div>

    <div className="mk-task">
      <span className="mk-label">Currently focused on</span>
      <p className="mk-task-name">Reading a book on software engineering</p>
    </div>

    <span className="mk-btn mk-btn--solid">End session</span>
  </div>
);

const NudgeScreen = () => (
  <div className="mk mk--nudge">
    <div className="mk-behind" aria-hidden>
      <svg viewBox="0 0 100 100">
        <circle className="mk-ring-track" cx="50" cy="50" r="42" />
        <circle
          className="mk-ring-arc"
          cx="50"
          cy="50"
          r="42"
          strokeDasharray="263.9"
          strokeDashoffset="150"
        />
      </svg>
    </div>

    <div className="mk-sheet">
      <div className="mk-sheet-head">
        <span className="mk-avatar" aria-hidden>
          <MessageCircle className="mk-avatar-icon" strokeWidth={2} />
        </span>
        <span className="mk-sheet-head-text">
          <span className="mk-brand">Stride</span>
          <span className="mk-chip">Focus check</span>
        </span>
      </div>
      <p className="mk-message mk-message--quiet">3 down. Settling in?</p>
      <div className="mk-actions">
        <span className="mk-btn mk-btn--ghost">Not now</span>
        <span className="mk-btn mk-btn--solid">Got it</span>
      </div>
    </div>
  </div>
);

const moods = [
  { label: "Focused", color: "#10221c", selected: true },
  { label: "Neutral", color: "#7c9389", selected: false },
  { label: "Distracted", color: "#b4c5bd", selected: false },
];

const CheckScreen = () => (
  <div className="mk mk--check">
    <div className="mk-sheet mk-sheet--tall">
      <div className="mk-sheet-head">
        <span className="mk-avatar" aria-hidden>
          <MessageCircle className="mk-avatar-icon" strokeWidth={2} />
        </span>
        <span className="mk-sheet-head-text">
          <span className="mk-brand">Stride</span>
          <span className="mk-chip">Feedback</span>
        </span>
      </div>
      <p className="mk-message">Quick check — how&apos;s your focus?</p>

      <div className="mk-moods">
        {moods.map((m) => (
          <span
            className="mk-mood"
            data-selected={m.selected ? "true" : undefined}
            key={m.label}
            style={
              m.selected
                ? ({ "--mk-mood-color": m.color } as CSSProperties)
                : undefined
            }
          >
            <span className="mk-mood-icon">
              {m.label === "Focused" && <ThumbsUp className="mk-mood-glyph" strokeWidth={2} />}
              {m.label === "Neutral" && <Minus className="mk-mood-glyph" strokeWidth={2} />}
              {m.label === "Distracted" && <ThumbsDown className="mk-mood-glyph" strokeWidth={2} />}
            </span>
            <span className="mk-mood-label" style={m.selected ? { color: m.color } : undefined}>
              {m.label}
            </span>
          </span>
        ))}
      </div>

      <span className="mk-btn mk-btn--solid mk-btn--block">Continue</span>
    </div>
  </div>
);

const days = [
  { day: "Sun", score: 70, sessions: 2 },
  { day: "Mon", score: 0, sessions: 0 },
  { day: "Tue", score: 91, sessions: 3, best: true },
  { day: "Wed", score: 62, sessions: 1 },
  { day: "Thu", score: 0, sessions: 0 },
  { day: "Fri", score: 0, sessions: 0 },
  { day: "Sat", score: 55, sessions: 1, today: true },
];
const maxScore = Math.max(...days.map((d) => d.score), 1);

const FingerprintScreen = () => (
  <div className="mk mk--fp">
    <div className="mk-fp-head">
      <span className="mk-fp-title">Focus by day</span>
      <span className="mk-fp-best">
        Best: <span className="mk-fp-best-day">Tuesdays</span>
      </span>
    </div>

    <div className="mk-rows">
      {days.map((day) => (
        <div className="mk-row" key={day.day}>
          <span className={`mk-row-day${day.today ? " mk-row-day--today" : ""}`}>
            {day.day}
          </span>
          <span className="mk-row-track">
            <span
              className="mk-row-bar"
              data-best={day.best ? "true" : undefined}
              data-today={day.today ? "true" : undefined}
              data-empty={day.score === 0 ? "true" : undefined}
              style={{ width: `${day.score > 0 ? Math.max((day.score / maxScore) * 100, 8) : 0}%` }}
            >
              {day.score > 0 && <span className="mk-row-score">{day.score}</span>}
            </span>
          </span>
          <span className="mk-row-count">{day.sessions > 0 ? `${day.sessions} sess` : "—"}</span>
        </div>
      ))}
    </div>

    <div className="mk-fp-legend">
      <span className="mk-legend-item">
        <span className="mk-legend-swatch" data-tone="best" />
        Best day
      </span>
      <span className="mk-legend-item">
        <span className="mk-legend-swatch" data-tone="today" />
        Today
      </span>
    </div>
  </div>
);

export const screens = {
  session: SessionScreen,
  nudge: NudgeScreen,
  check: CheckScreen,
  fingerprint: FingerprintScreen,
};

/** Mount once alongside the section that uses the screens. */
export function ScreenStyles() {
  return (
    <style>{`
      .mk {
        container-type: inline-size;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #f4f7f2;
        color: var(--ink);
        font-family: var(--font-sans);
        overflow: hidden;
      }

      /* ---------- shared atoms ---------- */
      .mk-label {
        font-size: 3.1cqw;
        font-weight: 500;
        line-height: 1.3;
        color: var(--quiet);
      }
      .mk-dot {
        width: 2cqw; height: 2cqw;
        border-radius: 50%;
        background: var(--field-2);
        flex-shrink: 0;
      }
      .mk-status {
        display: inline-flex;
        align-items: center;
        align-self: center;
        gap: 2cqw;
        margin-top: 5.6cqw;
        padding: 1.8cqw 4cqw;
        border-radius: 999px;
        background: #f4f7f2;
        font-size: 3.2cqw;
        font-weight: 500;
        color: var(--body);
      }

      .mk-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        font-size: 3.4cqw;
        font-weight: 500;
        line-height: 1;
        padding: 3cqw 6cqw;
        white-space: nowrap;
      }
      .mk-btn--block { width: 100%; }
      .mk-btn--solid { background: var(--ink); color: var(--on-dark); }
      .mk-btn--ghost {
        background: transparent;
        color: var(--body);
        border: 0.4cqw solid var(--rule);
      }

      .mk-chip {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 1.4cqw 2.8cqw;
        background: rgba(16, 34, 28, 0.06);
        color: var(--field-2);
        font-size: 2.8cqw;
        font-weight: 600;
        line-height: 1;
      }

      .mk-brand { font-size: 3.75cqw; font-weight: 600; letter-spacing: -0.01em; }

      .mk-ring-track { fill: none; stroke: var(--edge); stroke-width: 3; }
      .mk-ring-arc {
        fill: none;
        stroke: var(--ink);
        stroke-width: 3;
        stroke-linecap: round;
        transform: rotate(-90deg);
        transform-origin: 50% 50%;
      }

      /* ---------- session ---------- */
      .mk--session { justify-content: space-between; padding-bottom: 6cqw; }
      .mk-ring {
        position: relative;
        width: 52cqw;
        align-self: center;
        margin-top: 2cqw;
      }
      .mk-ring svg { width: 100%; display: block; }
      .mk-ring-inner {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 1cqw;
      }
      .mk-time {
        font-size: 11.5cqw;
        font-weight: 700;
        letter-spacing: -0.04em;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .mk-remaining { font-size: 2.9cqw; color: var(--quiet); }

      .mk-task {
        display: flex; flex-direction: column; gap: 1.6cqw;
        padding: 0 5.6cqw;
        text-align: center;
        align-items: center;
      }
      .mk-task-name {
        margin: 0;
        font-size: 4.4cqw;
        font-weight: 600;
        line-height: 1.25;
        letter-spacing: -0.015em;
        max-width: 22ch;
      }
      .mk--session .mk-btn { align-self: center; }

      /* ---------- nudge ---------- */
      .mk--nudge { justify-content: flex-end; }
      .mk-behind {
        position: absolute;
        top: 8cqw; left: 50%;
        width: 52cqw;
        transform: translateX(-50%);
        opacity: 0.32;
      }
      .mk-behind svg { width: 100%; display: block; }

      .mk-sheet {
        position: relative;
        z-index: 1;
        margin: 0 4cqw 4cqw;
        padding: 5cqw;
        border-radius: 5cqw;
        background: #ffffff;
        border: 0.4cqw solid var(--rule);
        box-shadow: 0 4cqw 10cqw rgba(16, 34, 28, 0.10);
        display: flex;
        flex-direction: column;
        gap: 3.4cqw;
      }
      .mk-sheet--tall { margin-top: auto; }
      .mk-sheet-head { display: flex; align-items: center; gap: 2.6cqw; }
      .mk-sheet-head-text { display: flex; flex-direction: column; gap: 0.6cqw; }

      .mk-avatar {
        width: 11cqw;
        height: 11cqw;
        flex-shrink: 0;
        border-radius: 3cqw;
        background: linear-gradient(135deg, var(--field-2), var(--field-1));
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mk-avatar-icon { width: 5cqw; height: 5cqw; color: #ffffff; }

      .mk-message {
        margin: 0;
        font-size: 4.1cqw;
        font-weight: 600;
        line-height: 1.3;
        letter-spacing: -0.015em;
      }
      .mk-message--quiet { font-weight: 400; color: var(--body); }
      .mk-actions { display: flex; gap: 2.4cqw; }
      .mk-actions .mk-btn { flex: 1 1 0; }

      /* ---------- check: icon-square mood picker (mirrors CheckInModal) ---------- */
      .mk--check { justify-content: flex-end; }
      .mk-moods { display: flex; gap: 2.4cqw; }
      .mk-mood {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.6cqw;
        padding: 3cqw 1.6cqw;
        border-radius: 3.4cqw;
        border: 0.4cqw solid var(--rule);
      }
      .mk-mood[data-selected="true"] {
        border-color: var(--mk-mood-color, var(--ink));
        background: rgba(16, 34, 28, 0.05);
      }
      .mk-mood-icon {
        width: 9.6cqw;
        height: 9.6cqw;
        border-radius: 2.6cqw;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--edge);
      }
      .mk-mood[data-selected="true"] .mk-mood-icon {
        background: var(--mk-mood-color, var(--ink));
      }
      .mk-mood-glyph { width: 4.6cqw; height: 4.6cqw; color: var(--quiet); }
      .mk-mood[data-selected="true"] .mk-mood-glyph { color: #ffffff; }
      .mk-mood-label { font-size: 3cqw; font-weight: 500; color: var(--quiet); text-align: center; }

      /* ---------- fingerprint ---------- */
      .mk--fp { padding: 5.6cqw; gap: 3.6cqw; }

      .mk-fp-head { display: flex; align-items: baseline; justify-content: space-between; }
      .mk-fp-title { font-size: 3.8cqw; font-weight: 600; color: var(--ink); }
      .mk-fp-best { font-size: 2.9cqw; color: var(--quiet); }
      .mk-fp-best-day { font-weight: 500; color: var(--ink); }

      .mk-rows { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2.4cqw; }
      .mk-row { display: flex; align-items: center; gap: 2.4cqw; }
      .mk-row-day {
        width: 9cqw;
        flex-shrink: 0;
        font-size: 2.9cqw;
        color: var(--quiet);
      }
      .mk-row-day--today { font-weight: 600; color: var(--ink); }

      .mk-row-track {
        flex: 1;
        height: 6.2cqw;
        border-radius: 1.6cqw;
        background: #f4f7f2;
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
      }
      .mk-row-bar {
        height: 100%;
        border-radius: 1.6cqw;
        background: var(--field-5);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 1.6cqw;
        transition: width 0.3s ease;
      }
      .mk-row-bar[data-best="true"] { background: var(--field-1); }
      .mk-row-bar[data-today="true"] { background: var(--accent, #8aa89c); }
      .mk-row-bar[data-empty="true"] { background: transparent; width: 0 !important; }
      .mk-row-score { font-size: 2.6cqw; font-weight: 500; color: #ffffff; }

      .mk-row-count { width: 11cqw; flex-shrink: 0; text-align: right; font-size: 2.6cqw; color: var(--quiet); }

      .mk-fp-legend {
        display: flex;
        gap: 4cqw;
        padding-top: 3.2cqw;
        border-top: 0.4cqw solid var(--edge);
      }
      .mk-legend-item {
        display: flex;
        align-items: center;
        gap: 1.4cqw;
        font-size: 2.6cqw;
        color: var(--quiet);
      }
      .mk-legend-swatch { width: 2.4cqw; height: 2.4cqw; border-radius: 0.6cqw; }
      .mk-legend-swatch[data-tone="best"] { background: var(--field-1); }
      .mk-legend-swatch[data-tone="today"] { background: #8aa89c; }
    `}</style>
  );
}