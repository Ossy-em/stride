"use client";

/**
 * Testimonials: 2x2 grid of outlined cards.
 * Quote at the top, person pinned to the bottom of each card.
 */

import { motion, useReducedMotion } from "framer-motion";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Jordan",
    role: "Designer",
    quote:
      "Amazing product. Perfect for someone with ADHD. Most timers assume you can just decide to concentrate, and when I lose the thread there's nothing there to catch it. Stride actually notices and pulls me back before I've lost the whole afternoon.",
  },
  {
    name: "Sam",
    role: "Student",
    quote:
      "Stride has been an extremely helpful tool for my study sessions. Ever since I started using it, it's become my default focus app. Can't wait to see what's next.",
  },
  {
    name: "Riley",
    role: "Student",
    quote:
      "I love how the timer switches to a stopwatch once you go past your session limit. This is everything I've been looking for in a focus app, I'll be telling my friends about it.",
  },
  {
    name: "Mara",
    role: "PhD Researcher",
    quote:
      "I started using it to get through writing days and stayed for the focus fingerprint. Seeing which hours I genuinely hold attention changed how I plan the week. It's the first tool that told me something about how I work that I didn't already know.",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase();

const EASE = [0.22, 1, 0.36, 1] as const;

export default function StrideStories() {
  const reduced = useReducedMotion();

  return (
    <section className="st section">
      <style>{`
        .st-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--grid-gap);
        }
        .st-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: var(--head-gap);
          padding: var(--stack-md);
          border-radius: var(--radius-card);
          box-shadow: inset 0 0 0 var(--hair) var(--hair-color);
        }
        .st-card .t-lead { max-width: none; }

        .st-person { display: flex; align-items: center; gap: 12px; }
        .st-avatar {
          flex-shrink: 0;
          width: 40px; height: 40px;
          border-radius: 999px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--surface);
          box-shadow: inset 0 0 0 var(--hair) var(--hair-color);
          color: var(--ink);
          font-size: var(--fs-sm);
          font-weight: var(--fw-heading);
        }
        .st-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

        @media (min-width: 768px) {
          .st-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .st-card { padding: var(--stack-lg); }
        }
      `}</style>

      <div className="l-inner">
        <header className="l-head">
          <h2 className="t-title">Stories from our community</h2>
        </header>

        <div className="st-grid">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.name}
              className="st-card"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: EASE }}
            >
              <p className="t-lead">{t.quote}</p>
              <div className="st-person">
                <span className="st-avatar" aria-hidden>
                  {initials(t.name)}
                </span>
                <span className="st-meta">
                  <span className="t-heading">{t.name}</span>
                  <span className="t-small">{t.role}</span>
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
