"use client";

/**
 * Feature showcase: one block per feature, structured after linear.app's
 * homepage sections.
 *
 *   header   2-line heading (left half) + large lead paragraph (right half)
 *   stage    a frameless product film of the real app, full container width,
 *            blending into the page (no border, no corners)
 *   list     the sub-features; each one with a film is a tab. The active
 *            film plays while on screen and moves to the next tab when it ends.
 *
 * Copy is Stride's own: FAQ answers, meta description and product UI labels.
 */

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** A card: one short film of one piece of the app, placed on the stage (percent of stage width/top). */
/** mobile: the one card shown on phones, and the shape it's cropped to there */
type Card = { film: string; alt: string; ratio: number; left: number; top: number; width: number; back?: boolean; mobile?: string };
type Feature = { id: string; title: [string, string]; lead: string; items: string[]; cards: Card[]; scene?: "agent" };

const features: Feature[] = [
  {
    id: "predicts",
    title: ["Predicts distraction.", "Protects your focus."],
    lead: "Stride checks in during your sessions and asks how you feel. Over time, it spots patterns like when you usually drift, what causes it, and what helps.",
    items: ["Focus check", "Feedback", "Interventions", "Drift pattern"],
    cards: [
      { film: "c-timer", alt: "A focus session timer with check-in marks on its timeline", ratio: 690 / 1080, left: 32, top: 6, width: 56, back: true, mobile: "5 / 4" },
      { film: "c-checkin", alt: "A nudge, then telling Stride what's pulling you away", ratio: 540 / 720, left: 6, top: 18, width: 34 },
      { film: "c-drift", alt: "Insights showing the minute you usually drift", ratio: 330 / 900, left: 58, top: 64, width: 42 },
    ],
  },
  {
    id: "nudges",
    title: ["Short, calm", "messages"],
    lead: "Sometimes a quick breathing exercise. Sometimes a stretch. Sometimes just a check-in. The more you use it, the more personalized they get.",
    items: ["Breathing exercise", "Stretch", "Check-in", "Push notifications"],
    cards: [
      { film: "c-push", alt: "A Stride notification arriving and opening the nudge", ratio: 450 / 780, left: 46, top: 6, width: 40, back: true },
      { film: "c-nudge-break", alt: "A nudge suggesting a break, then the quick reset", ratio: 780 / 720, left: 10, top: 5, width: 30, mobile: "720 / 780" },
      { film: "c-nudge-checkin", alt: "A check-in nudge during a session", ratio: 540 / 720, left: 54, top: 50, width: 34 },
    ],
  },
  {
    id: "fingerprint",
    title: ["Your Focus", "Fingerprint"],
    lead: "It gathers your patterns, habits, strengths, and challenges in one place, and helps you understand how you work best.",
    items: ["Peak hours", "Focus by day", "Best day", "Streaks"],
    cards: [
      { film: "c-peak", alt: "Peak hours chart with focus by hour", ratio: 600 / 1080, left: 4, top: 6, width: 54, back: true, mobile: "4 / 3" },
      { film: "c-days", alt: "Focus by day of the week", ratio: 510 / 840, left: 52, top: 16, width: 40 },
      { film: "c-week", alt: "The weekly review on Home with last week's best day", ratio: 390 / 1080, left: 14, top: 64, width: 50 },
    ],
  },
  {
    id: "agent",
    title: ["The Stride", "Agent"],
    lead: "Get answers from your own sessions and drifts. Turn a deadline into focus blocks in your peak hours. Talk it through, then get back into your session.",
    items: ["Ask about your patterns", "Plan work into sessions", "Get unstuck"],
    cards: [],
    scene: "agent",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function Block({ f }: { f: Feature }) {
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);

  // all cards in a section play together, only while it's on screen
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const videos = () => Array.from(el.querySelectorAll("video"));
    const io = new IntersectionObserver(
      ([e]) => videos().forEach((v) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reveal = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: EASE },
      };

  return (
    <section className="fs section" id={`feature-${f.id}`}>
      <div className="l-inner">
        <motion.header className="l-head" {...reveal}>
          <h2 className="t-title">
            {f.title[0]}
            <br />
            {f.title[1]}
          </h2>
          <p className="t-lead">{f.lead}</p>
        </motion.header>

        <motion.div className={f.scene ? `fs-visual fs-visual--${f.scene}` : "fs-visual"} ref={stage} {...reveal}>
          {f.scene === "agent" && (
            <>
              {/* still: the Sessions it plans into, behind */}
              <img
                className="fs-agent-bg"
                src="/features/agent-sessions.jpg"
                alt="Sessions in Stride"
                loading="lazy"
                decoding="async"
              />
              {/* film: the Agent planning tomorrow, in front */}
              <div className="fs-card fs-agent-chat">
                <video
                  src="/features/c-agent-plan.mp4"
                  poster="/features/c-agent-plan.jpg"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="The Agent planning tomorrow around your peak hours"
                />
              </div>
            </>
          )}
          {f.cards.map((c) => (
            <div
              key={c.film}
              className="fs-card"
              data-back={c.back || undefined}
              data-mobile={c.mobile ? "" : undefined}
              style={
                {
                  left: `${c.left}%`,
                  top: `${c.top}%`,
                  width: `${c.width}%`,
                  aspectRatio: `1 / ${c.ratio}`,
                  "--m-ratio": c.mobile,
                } as React.CSSProperties
              }
            >
              <video
                src={`/features/${c.film}.mp4`}
                poster={`/features/${c.film}.jpg`}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={c.alt}
              />
            </div>
          ))}
        </motion.div>

        <ul className="fs-items">
          {f.items.map((item) => (
            <li className="t-body" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function FeatureShowcase() {
  return (
    <div className="fs-wrap" id="features">
      <style>{`
        /* stage: Linear-style cards, each its own film on its own app background,
           overlapping, with the outer edges fading into the page */
        .fs-visual {
          position: relative;
          aspect-ratio: 2 / 1;
          margin: 0 calc(-1 * var(--gutter));
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%),
            linear-gradient(to bottom, #000 78%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-image: linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%),
            linear-gradient(to bottom, #000 78%, transparent 100%);
          mask-composite: intersect;
        }
        .fs-card {
          position: absolute;
          border-radius: 12px;
          overflow: hidden;
          background: #111113;
          border: 1px solid var(--panel-edge);
          border-top-color: var(--panel-edge-top);
          line-height: 0;
        }
        /* cards behind sink into the page instead of casting shadows */
        .fs-card[data-back] { opacity: 0.45; }
        .fs-card video { display: block; width: 100%; height: 100%; object-fit: cover; }

        /* Agent: one wide still behind, one film in front (Linear's thread-over-board) */
        .fs-visual--agent {
          aspect-ratio: 5 / 4;
          -webkit-mask-image: linear-gradient(to bottom, #000 86%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 86%, transparent 100%);
        }
        .fs-agent-bg {
          position: absolute; left: 30%; top: 12%; width: 120%; max-width: none; height: auto;
          border-radius: 12px; border: 1px solid var(--panel-edge); border-top-color: var(--panel-edge-top);
          -webkit-mask-image: linear-gradient(to right, #000 30%, rgba(0,0,0,.35) 75%, transparent 95%);
          mask-image: linear-gradient(to right, #000 30%, rgba(0,0,0,.35) 75%, transparent 95%);
        }
        .fs-agent-chat { left: 6%; top: 3%; width: 48%; aspect-ratio: 690 / 900; z-index: 1; }
        @media (min-width: 768px) {
          .fs-visual--agent { aspect-ratio: 2 / 1; }
          .fs-agent-bg { left: 22%; top: 9%; width: 96%; }
          .fs-agent-chat { left: 0; top: 3%; width: 30%; }
        }

        /* phones: one film per section, full width and taller, cropped
           to fill (Linear's mobile layout). The rest stay off-screen. */
        @media (max-width: 767px) {
          .fs-visual, .fs-visual--agent {
            aspect-ratio: auto;
            margin: 0;
            overflow: visible;
            -webkit-mask-image: none;
            mask-image: none;
          }
          .fs-card { display: none; }
          .fs-card[data-mobile], .fs-agent-chat {
            display: block;
            position: relative;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            opacity: 1;
          }
          .fs-card[data-mobile] { aspect-ratio: var(--m-ratio) !important; }
          .fs-card[data-mobile] video[src*="c-peak"] { object-position: left center; } /* keep the chart title */
          .fs-agent-chat { aspect-ratio: 690 / 900; }
          .fs-agent-bg { display: none; }
        }

        /* sub-features: 2-col list under the lead column */
        .fs-items {
          list-style: none;
          margin: var(--stack-lg) 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--stack-xs) var(--grid-gap);
        }

        @media (min-width: 768px) {
          .fs-visual { margin: 0; }
          /* list starts on the lead column (half + header column gap) */
          .fs-items { margin-left: calc(50% + var(--grid-gap) / 2); }
        }

        /* consecutive blocks: one section padding between them, not two */
        .fs + .fs { padding-top: 0; }
      `}</style>
      {features.map((f) => (
        <Block key={f.id} f={f} />
      ))}
    </div>
  );
}
