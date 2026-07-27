"use client";

import Button from "@/components/ui/Button";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { screens, ScreenStyles } from "@/components/mocks/StrideScreens";

const tiles = [
  { Screen: screens.session, area: "a1" },
  { Screen: screens.nudge, area: "a2" },
  { Screen: screens.check, area: "a3" },
  { Screen: screens.fingerprint, area: "a4" },
];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const blurUp: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 8 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 16, mass: 0.75 },
  },
};

export default function StrideCTA() {
  const reduced = useReducedMotion();

  return (
    <section className="cta">
      <ScreenStyles />
      <style>{`
        .cta {
          position: relative;
          width: 100%;
          background: var(--ground);
          overflow: hidden;
          padding: var(--section-y) var(--gutter);
          font-family: var(--font-sans);
        }

        .cta-inner {
          position: relative;
          z-index: 2;
          max-width: var(--maxw);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          gap: var(--s-7);
        }

        .cta-h2 {
          margin: 0 0 var(--s-4);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h2);
          line-height: var(--lh-h2);
          letter-spacing: var(--ls-h2);
          color: var(--ink);
          max-width: 14ch;
        }
        .cta-sub {
          margin: 0 0 var(--s-6);
          font-size: var(--fs-lead);
          font-weight: var(--fw-regular);
          line-height: var(--lh-lead);
          color: var(--body);
          max-width: 32ch;
        }

        /* ---- offset interlocking gallery ---- */
        .cta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 3fr 1fr 3fr 1fr;
          gap: var(--s-3);
          height: clamp(400px, 108vw, 540px);
        }
        .cta-cell {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius-tile);
          background: var(--surface);
          transition: transform var(--dur-slow) var(--ease-out),
                      box-shadow var(--dur-slow) var(--ease-out);
        }
        .cta-cell:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 44px rgba(16, 34, 28, 0.08);
        }
        @media (prefers-reduced-motion: reduce) {
          .cta-cell { transition: none; }
          .cta-cell:hover { transform: none; box-shadow: none; }
        }

        .a1 { grid-column: 2 / 3; grid-row: 1 / 3; }
        .a2 { grid-column: 1 / 2; grid-row: 2 / 4; }
        .a3 { grid-column: 1 / 2; grid-row: 4 / 6; }
        .a4 { grid-column: 2 / 3; grid-row: 3 / 5; }

        @media (min-width: 900px) {
          .cta-inner { grid-template-columns: 1fr 1fr; gap: 7%; }
          .cta-grid {
            gap: var(--s-4);
            height: clamp(520px, 52vw, 700px);
          }
        }
      `}</style>

      <div className="cta-inner">
        <motion.div
          variants={reduced ? undefined : stagger}
          initial={reduced ? undefined : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2 className="cta-h2" variants={reduced ? undefined : blurUp}>
            Start before you drift.
          </motion.h2>
          <motion.p className="cta-sub" variants={reduced ? undefined : blurUp}>
            It steps in before it happens, and gets sharper over time.
          </motion.p>
          <motion.div variants={reduced ? undefined : blurUp}>
            <Button href="/signin" variant="solid" size="md">
              Start a session
            </Button>
          </motion.div>
        </motion.div>

        <div className="cta-grid">
          {tiles.map(({ Screen, area }, i) => (
            <motion.div
              key={area}
              className={`cta-cell ${area}`}
              initial={reduced ? undefined : { opacity: 0, filter: "blur(10px)" }}
              whileInView={reduced ? undefined : { opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <Screen />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}