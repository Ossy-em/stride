"use client";

/**
 * How-it-works illustrations: monochrome hairline drawings in the landing
 * palette (Linear-style). One highlight per drawing, in ink; everything else
 * in quiet grey. They draw in once on view, then idle with a small loop.
 *
 *   Drift     attention as a line that sags, the nudge lands on the dip
 *   Layers    sessions stacked in 3D; drift moments line up into a pattern
 *   Rhythm    a 24-hour dial, focus by hour, peak hours lit
 */

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;
const QUIET = "var(--quiet)";
const EDGE = "rgba(255,255,255,0.08)";
const INK = "var(--ink)";

function Svg({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 240" className="hiw-svg" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

/* ---------------- 1. drift + nudge ---------------- */

// attention: steady, sags toward the drift point, recovers after the nudge
const DRIFT = "M20 92 C70 92 96 94 120 104 S150 150 172 150 S196 112 214 100 S262 92 300 92";
const NUDGE = { x: 172, y: 150 };

export function DriftIllustration() {
  const reduced = useReducedMotion();
  const draw = reduced
    ? {}
    : { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true }, transition: { duration: 1.6, ease: EASE } };

  return (
    <Svg label="A line of attention that dips, with a nudge landing at the dip">
      {/* minute ruler */}
      {Array.from({ length: 29 }, (_, i) => (
        <line key={i} x1={20 + i * 10} x2={20 + i * 10} y1={196} y2={i % 5 === 0 ? 186 : 191} stroke={EDGE} />
      ))}
      <line x1={20} x2={300} y1={196} y2={196} stroke={EDGE} />
      {/* where focus usually goes */}
      <line x1={NUDGE.x} x2={NUDGE.x} y1={40} y2={196} stroke={QUIET} strokeDasharray="2 4" opacity={0.6} />

      <motion.path d={DRIFT} fill="none" stroke={QUIET} strokeWidth={1.25} strokeLinecap="round" {...draw} />

      {/* nudge: rings pulse out from the dip */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={NUDGE.x}
          cy={NUDGE.y}
          r={6}
          fill="none"
          stroke={INK}
          strokeWidth={1}
          initial={{ scale: 1, opacity: 0 }}
          animate={reduced ? { opacity: 0 } : { scale: [1, 4.2], opacity: [0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 1.6 + i * 0.8, ease: "easeOut" }}
          style={{ transformOrigin: `${NUDGE.x}px ${NUDGE.y}px` }}
        />
      ))}
      <circle cx={NUDGE.x} cy={NUDGE.y} r={4} fill={INK} />
    </Svg>
  );
}

/* ---------------- 2. stacked sessions ---------------- */

// isometric plate, centred on (cx, cy)
const plate = (cx: number, cy: number, w = 104, h = 30) =>
  `M${cx - w} ${cy} L${cx} ${cy - h} L${cx + w} ${cy} L${cx} ${cy + h} Z`;
// a point on a plate: u across the long axis (-1..1), v across the short axis (-1..1)
const onPlate = (cx: number, cy: number, u: number, v: number, w = 104, h = 30) => ({
  x: cx + (u * w) / 2 + (v * w) / 2,
  y: cy - (u * h) / 2 + (v * h) / 2,
});

const LAYERS = [0, 1, 2, 3, 4];
const CX = 160;
const TOP = 56;
const GAP = 30;
// drift moments per session, newest on top: they converge as Stride learns
const DRIFTS = [
  { u: 0.12, v: 0.1 },
  { u: 0.15, v: 0.06 },
  { u: 0.08, v: 0.16 },
  { u: 0.4, v: -0.3 },
  { u: -0.45, v: 0.5 },
];

export function LayersIllustration() {
  const reduced = useReducedMotion();
  const pts = LAYERS.map((i) => onPlate(CX, TOP + i * GAP, DRIFTS[i].u, DRIFTS[i].v));
  const learned = onPlate(CX, TOP, 0.12, 0.1);
  const base = onPlate(CX, TOP + 4 * GAP, 0.12, 0.1);

  return (
    <Svg label="Sessions stacked on top of each other, with drift moments lining up into a pattern">
      {[...LAYERS].reverse().map((i) => {
        const cy = TOP + i * GAP;
        const top = i === 0;
        return (
          <motion.g
            key={i}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: (4 - i) * 0.12, ease: EASE }}
          >
            <path d={plate(CX, cy)} fill="var(--ground)" stroke={top ? QUIET : EDGE} strokeWidth={1} />
            <circle cx={pts[i].x} cy={pts[i].y} r={2.5} fill={top ? INK : QUIET} opacity={top ? 1 : 0.7} />
          </motion.g>
        );
      })}
      {/* the pattern: drift points line up through the stack */}
      <motion.line
        x1={base.x}
        y1={base.y}
        x2={learned.x}
        y2={learned.y}
        stroke={INK}
        strokeWidth={1}
        strokeDasharray="2 3"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.8 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
      />
      <motion.circle
        cx={learned.x}
        cy={learned.y}
        r={7}
        fill="none"
        stroke={INK}
        strokeWidth={1}
        animate={reduced ? undefined : { opacity: [0.15, 0.6, 0.15] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </Svg>
  );
}

/* ---------------- 3. 24-hour rhythm ---------------- */

// focus by hour (0-23), 0..1; peak 9-11
const HOURS = [0.08, 0.05, 0.04, 0.04, 0.05, 0.08, 0.18, 0.32, 0.55, 0.92, 1, 0.84, 0.5, 0.42, 0.6, 0.66, 0.58, 0.44, 0.3, 0.38, 0.46, 0.34, 0.2, 0.12];
const PEAK = new Set([9, 10, 11]);
const R0 = 34;
const R1 = 92;

export function RhythmIllustration() {
  const reduced = useReducedMotion();
  const c = { x: 160, y: 120 };

  return (
    <Svg label="A 24-hour dial of focus by hour, with peak hours highlighted">
      {[R0, (R0 + R1) / 2, R1].map((r) => (
        <circle key={r} cx={c.x} cy={c.y} r={r} fill="none" stroke={EDGE} />
      ))}
      {HOURS.map((v, h) => {
        const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
        const r2 = R0 + 4 + v * (R1 - R0 - 4);
        const peak = PEAK.has(h);
        return (
          <motion.line
            key={h}
            x1={c.x + Math.cos(a) * (R0 + 4)}
            y1={c.y + Math.sin(a) * (R0 + 4)}
            x2={c.x + Math.cos(a) * r2}
            y2={c.y + Math.sin(a) * r2}
            stroke={peak ? INK : QUIET}
            strokeWidth={peak ? 3 : 2}
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 + h * 0.03, ease: EASE }}
          />
        );
      })}
      {/* hour marks */}
      {[0, 6, 12, 18].map((h) => {
        const a = (h / 24) * Math.PI * 2 - Math.PI / 2;
        return (
          <text
            key={h}
            x={c.x + Math.cos(a) * (R1 + 14)}
            y={c.y + Math.sin(a) * (R1 + 14) + 3.5}
            textAnchor="middle"
            fontSize={10}
            fill={QUIET}
          >
            {h}
          </text>
        );
      })}
      <circle cx={c.x} cy={c.y} r={2.5} fill={QUIET} />
    </Svg>
  );
}

export function HiwIllustrationStyles() {
  return (
    <style>{`
      .hiw-svg { display: block; width: 100%; height: 100%; max-height: 240px; overflow: visible; }
    `}</style>
  );
}
