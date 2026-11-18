"use client";

/**
 * How It Works illustrations: product moments, stripped to the interaction.
 * No containers; elements sit directly on the page.
 *
 *   Nudge        timer dial mid-session, the nudge rising over it
 *   Learning     the three check-in states, "Focused" picked
 *   Fingerprint  a few days of focus, best day lit, faint guide lines
 *
 * Copy is the product's own (components/mocks/stride-screens.tsx).
 */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ThumbsUp, Minus, ThumbsDown } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

function Stage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={`fv ${className}`}
      initial={reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */

const TICKS = 60;
const PROGRESS = 0.42; // share of the session elapsed

export function NudgeIllustration() {
  const r = 46;
  const end = PROGRESS * Math.PI * 2 - Math.PI / 2;
  const dot = [50 + r * Math.cos(end), 50 + r * Math.sin(end)];

  return (
    <Stage className="fv--nudge">
      <svg className="fv-dial" viewBox="0 0 100 100">
        {/* minute ticks, every fifth longer */}
        {Array.from({ length: TICKS }).map((_, i) => {
          const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
          const long = i % 5 === 0;
          const r1 = long ? 36.5 : 38;
          const r2 = 40;
          const passed = i / TICKS < PROGRESS;
          return (
            <line
              key={i}
              x1={50 + r1 * Math.cos(a)}
              y1={50 + r1 * Math.sin(a)}
              x2={50 + r2 * Math.cos(a)}
              y2={50 + r2 * Math.sin(a)}
              className={passed ? "fv-tick fv-tick--on" : "fv-tick"}
            />
          );
        })}
        <circle cx="50" cy="50" r={r} className="fv-dial-track" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          className="fv-dial-arc"
          variants={{
            hidden: { pathLength: 0 },
            show: { pathLength: PROGRESS, transition: { duration: 1.4, ease: EASE } },
          }}
        />
        <motion.circle
          cx={dot[0]}
          cy={dot[1]}
          r="1.6"
          className="fv-dial-dot"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { delay: 1.2, duration: 0.3 } },
          }}
        />
      </svg>

      <motion.div
        className="fv-nudge"
        variants={{
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.7, ease: EASE } },
        }}
      >
        <p className="fv-msg">3 down. Settling in?</p>
        <div className="fv-actions">
          <span className="fv-btn fv-btn--ghost">Not now</span>
          <span className="fv-btn fv-btn--solid">Got it</span>
        </div>
      </motion.div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */

const moods = [
  { label: "Focused", Icon: ThumbsUp },
  { label: "Neutral", Icon: Minus },
  { label: "Distracted", Icon: ThumbsDown },
];

export function LearningIllustration() {
  return (
    <Stage className="fv--check">
      <div className="fv-moods">
        {moods.map(({ label, Icon }, i) => (
          <motion.span
            key={label}
            className="fv-mood"
            data-picked={i === 0 ? "true" : undefined}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: EASE } },
            }}
          >
            <span className="fv-mood-icon">
              <Icon strokeWidth={2} />
            </span>
            <span className="fv-mood-label">{label}</span>
            {i === 0 && (
              <motion.span
                className="fv-mood-ring"
                variants={{
                  hidden: { opacity: 0, scale: 0.96 },
                  show: { opacity: 1, scale: 1, transition: { delay: 1.15, duration: 0.35 } },
                }}
              />
            )}
          </motion.span>
        ))}

      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */

const days = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 91, best: true },
  { day: "Wed", score: 70 },
  { day: "Thu", score: 48 },
];

export function FingerprintIllustration() {
  return (
    <Stage className="fv--fp">
      <div className="fv-chart">
        {/* guide lines */}
        <div className="fv-guides">
          {[25, 50, 75, 100].map((g) => (
            <span key={g} style={{ left: `${g}%` }} />
          ))}
        </div>
        {days.map((d, i) => (
          <div className="fv-row" key={d.day}>
            <span className="fv-row-day" data-best={d.best ? "true" : undefined}>
              {d.day}
            </span>
            <span className="fv-row-track">
              <motion.span
                className="fv-row-bar"
                data-best={d.best ? "true" : undefined}
                style={{ originX: 0, width: `${d.score}%` }}
                variants={{
                  hidden: { scaleX: 0 },
                  show: {
                    scaleX: 1,
                    transition: { delay: 0.2 + i * 0.09, duration: 0.8, ease: EASE },
                  },
                }}
              />
              <motion.span
                className="fv-row-score"
                data-best={d.best ? "true" : undefined}
                style={{ left: `calc(${d.score}% + 5px)` }}
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { delay: 0.7 + i * 0.09, duration: 0.3 } },
                }}
              >
                {d.score}
              </motion.span>
            </span>
          </div>
        ))}
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */

/** Mount once in the section that uses the illustrations. */
export function FeatureIllustrationStyles() {
  return (
    <style>{`
      .fv {
        --fv-hair: var(--hair, 0.1px);
        /* muted line green: a step above the page, not a highlight */
        --fv-green: #2f5a46;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-sans);
        color: var(--ink);
      }

      /* ---- nudge ---- */
      .fv--nudge { min-height: 232px; }
      .fv-dial {
        position: absolute;
        top: 0;
        left: 50%;
        width: 200px;
        height: 200px;
        transform: translateX(-50%);
        overflow: visible;
      }
      .fv-tick { stroke: rgba(255, 255, 255, 0.8); stroke-width: 0.05; stroke-linecap: round; }
      .fv-tick--on { stroke: #ffffff; }
      .fv-dial-track { fill: none; stroke: rgba(255, 255, 255, 0.8); stroke-width: 0.05; }
      .fv-dial-arc {
        fill: none; stroke: var(--fv-green); stroke-width: 0.1; stroke-linecap: round;
        transform: rotate(-90deg); transform-origin: 50% 50%;
      }
      .fv-dial-dot { fill: var(--fv-green); }

      .fv-nudge {
        position: absolute;
        bottom: 6px;
        width: min(248px, 100%);
        padding: 14px;
        border-radius: 14px;
        background: var(--ground); /* matches the page; hides the dial behind */
        box-shadow: inset 0 0 0 var(--fv-hair) rgba(255, 255, 255, 0.85);
      }
      .fv-msg {
        margin: 0 0 14px;
        font-size: 14px; line-height: 1.4; letter-spacing: -0.01em;
        color: var(--ink);
      }
      .fv-actions { display: flex; gap: 8px; justify-content: flex-end; }
      .fv-btn {
        display: inline-flex; align-items: center; justify-content: center;
        height: 30px; padding: 0 12px; border-radius: 999px;
        font-size: 12px; font-weight: 510; white-space: nowrap;
      }
      .fv-btn--ghost { color: var(--ink); box-shadow: inset 0 0 0 var(--fv-hair) rgba(255, 255, 255, 0.8); }
      .fv-btn--solid { background: var(--ink); color: var(--ground); }

      /* ---- check-in ---- */
      .fv-moods {
        position: relative;
        display: grid;
        grid-template-columns: repeat(3, 84px);
        gap: 10px;
      }
      .fv-mood {
        position: relative;
        display: flex; flex-direction: column; align-items: center; gap: 10px;
        padding: 14px 4px 12px;
        border-radius: 12px;
        box-shadow: inset 0 0 0 var(--fv-hair) rgba(255, 255, 255, 0.85);
      }
      .fv-mood-icon {
        width: 32px; height: 32px;
        display: inline-flex; align-items: center; justify-content: center;
        color: rgba(255, 255, 255, 0.85);
      }
      .fv-mood-icon svg { width: 18px; height: 18px; stroke-width: 0.35; }
      .fv-mood-label { font-size: 12px; color: var(--body); }
      .fv-mood[data-picked] .fv-mood-icon { color: var(--fv-green); }
      .fv-mood[data-picked] { box-shadow: none; }
      .fv-mood[data-picked] .fv-mood-label { color: var(--ink); }
      .fv-mood-ring {
        position: absolute; inset: 0;
        border-radius: 12px;
        box-shadow: inset 0 0 0 var(--fv-hair) var(--fv-green);
        pointer-events: none;
      }

      /* ---- fingerprint ---- */
      .fv-chart {
        position: relative;
        width: min(260px, 100%);
        display: flex; flex-direction: column; gap: 12px;
      }
      .fv-guides {
        position: absolute;
        top: -10px; bottom: -10px;
        left: 40px; right: 30px;
        pointer-events: none;
        z-index: 0;
      }
      .fv-guides span {
        position: absolute; top: 0; bottom: 0;
        width: 1px;
        background: repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 0 3px, transparent 3px 6px);
        transform: scaleX(0.1);
      }
      .fv-row { position: relative; z-index: 1; display: grid; grid-template-columns: 30px 1fr; align-items: center; gap: 10px; }
      .fv-row-day { font-size: 12px; color: var(--quiet); }
      .fv-row-day[data-best] { color: var(--ink); }
      .fv-row-track { position: relative; height: 22px; margin-right: 30px; }
      .fv-row-bar {
        position: absolute; left: 0; top: 0; bottom: 0;
        border-radius: 6px;
        background: #1a1c1f; /* solid so guides pass behind */
      }
      .fv-row-bar[data-best] { background: #2c6b4b; }
      .fv-row-score {
        position: absolute; top: 50%; transform: translateY(-50%);
        padding: 0 3px;
        background: var(--ground); /* clears the guide line under the number */
        font-size: 11px; font-weight: 510; color: var(--quiet);
        font-variant-numeric: tabular-nums;
      }
      .fv-row-score[data-best] { color: var(--accent); }
    `}</style>
  );
}
