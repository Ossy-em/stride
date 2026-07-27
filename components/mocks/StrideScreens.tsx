"use client";

/**
 * Stride product screens — coded mockups, not screenshots.
 *
 * Each screen is built in a container-query space, so every value scales
 * with the tile it sits in. Sizes are authored against a nominal 320px
 * phone width: 1cqw ≈ 3.2px at that width.
 *
 * These are design targets as much as marketing assets — if the real UI
 * catches up to them, these can be retired.
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
        />
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

    <span className="mk-btn mk-btn--ghost">End session</span>
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
        <span className="mk-brand">Stride</span>
        <span className="mk-chip">Focus check</span>
      </div>
      <p className="mk-message">3 down. Settling in?</p>
      <div className="mk-actions">
        <span className="mk-btn mk-btn--ghost">Not now</span>
        <span className="mk-btn mk-btn--solid">Got it</span>
      </div>
    </div>
  </div>
);

const options = [
  { level: "1", label: "Focused", note: "I'm in the zone" },
  { level: "2", label: "Drifting", note: "Mind's wandering a bit" },
  { level: "3", label: "Lost", note: "Can't focus at all" },
];

const CheckScreen = () => (
  <div className="mk mk--check">
    <div className="mk-sheet mk-sheet--tall">
      <div className="mk-sheet-head">
        <span className="mk-brand">Stride</span>
        <span className="mk-chip">Feedback</span>
      </div>
      <p className="mk-message">Quick check — how&apos;s your focus?</p>

      <div className="mk-options">
        {options.map((o) => (
          <span className="mk-option" data-level={o.level} key={o.label}>
            <span className="mk-option-bar" />
            <span className="mk-option-text">
              <span className="mk-option-label">{o.label}</span>
              <span className="mk-option-note">{o.note}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  </div>
);

const days = [
  { d: "S", v: 70 },
  { d: "M", v: 0 },
  { d: "T", v: 100, best: true },
  { d: "W", v: 62 },
  { d: "T", v: 0 },
  { d: "F", v: 0 },
  { d: "S", v: 55 },
];

const FingerprintScreen = () => (
  <div className="mk mk--fp">
    <span className="mk-label">Your focus fingerprint</span>

    <div className="mk-stat">
      <span className="mk-stat-num">90</span>
      <span className="mk-stat-unit">avg focus</span>
      <span className="mk-chip mk-chip--up">+3%</span>
    </div>

    <div className="mk-bars">
      {days.map((day, i) => (
        <span className="mk-bar-col" key={i}>
          <span className="mk-bar-track">
            <span
              className="mk-bar"
              data-best={day.best ? "true" : undefined}
              data-empty={day.v === 0 ? "true" : undefined}
              style={{ height: `${day.v === 0 ? 3 : day.v}%` }}
            />
          </span>
          <span className="mk-bar-day">{day.d}</span>
        </span>
      ))}
    </div>

    <p className="mk-note">Best: Tuesdays</p>
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
        display: flex;
        align-items: center;
        gap: 2cqw;
        padding: 5.6cqw 5.6cqw 0;
        font-size: 3.4cqw;
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
      .mk-btn--solid { background: var(--ink); color: var(--on-dark); }
      .mk-btn--ghost {
        background: transparent;
        color: var(--ink);
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
      .mk-chip--up { background: rgba(16, 34, 28, 0.06); color: var(--field-2); }

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
      .mk-sheet-head { display: flex; align-items: center; gap: 2.4cqw; }
      .mk-message {
        margin: 0;
        font-size: 4.1cqw;
        font-weight: 600;
        line-height: 1.3;
        letter-spacing: -0.015em;
      }
      .mk-actions { display: flex; gap: 2.4cqw; }
      .mk-actions .mk-btn { flex: 1 1 0; }

      /* ---------- check ---------- */
      .mk--check { justify-content: flex-end; }
      .mk-options { display: flex; flex-direction: column; gap: 2cqw; }
      .mk-option {
        display: flex;
        align-items: center;
        gap: 3cqw;
        padding: 2.8cqw 3cqw;
        border-radius: 3cqw;
        border: 0.4cqw solid var(--rule);
      }
      .mk-option-bar {
        width: 1.2cqw;
        height: 7cqw;
        border-radius: 999px;
        flex-shrink: 0;
      }
      /* depth of green = strength of focus. no icons, no new hues. */
      .mk-option[data-level="1"] .mk-option-bar { background: var(--field-1); }
      .mk-option[data-level="2"] .mk-option-bar { background: var(--field-4); }
      .mk-option[data-level="3"] .mk-option-bar { background: var(--field-6); }

      .mk-option-text { display: flex; flex-direction: column; gap: 0.4cqw; min-width: 0; }
      .mk-option-label { font-size: 3.6cqw; font-weight: 600; line-height: 1.2; }
      .mk-option-note { font-size: 3cqw; color: var(--quiet); line-height: 1.2; }

      /* ---------- fingerprint ---------- */
      .mk--fp { padding: 5.6cqw; gap: 4cqw; }
      .mk-stat { display: flex; align-items: baseline; gap: 2.4cqw; }
      .mk-stat-num {
        font-size: 14cqw;
        font-weight: 700;
        line-height: 0.9;
        letter-spacing: -0.05em;
        font-variant-numeric: tabular-nums;
      }
      .mk-stat-unit { font-size: 3.1cqw; color: var(--quiet); }

      .mk-bars {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1.8cqw;
        align-items: end;
      }
      .mk-bar-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2cqw;
        height: 100%;
        justify-content: flex-end;
      }
      .mk-bar-track {
        width: 100%;
        flex: 1;
        display: flex;
        align-items: flex-end;
      }
      .mk-bar {
        width: 100%;
        border-radius: 1.2cqw;
        background: var(--field-5);
      }
      .mk-bar[data-best="true"] { background: var(--field-1); }
      .mk-bar[data-empty="true"] { background: #e2e8e4; }
      .mk-bar-day { font-size: 2.8cqw; color: var(--quiet); line-height: 1; }

      .mk-note { margin: 0; font-size: 3cqw; color: var(--body); }
    `}</style>
  );
}