"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";

const text =
  "Concentration is difficult to sustain and effortless to lose. The hours dissolve into distractions you hardly notice. Stride exists to safeguard your attention.";

const DIM = "#dfe4e0"; // --field-6
const INK = "#10221c"; // --field-1

// how much of the scroll each letter takes to fill.
// larger = softer leading edge, smaller = harder wipe.
const WINDOW = 0.16;

const letterTotal = text.replace(/ /g, "").length;

function Letter({
  char,
  index,
  progress,
}: {
  char: string;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = (index / letterTotal) * (1 - WINDOW);
  const color = useTransform(progress, [start, start + WINDOW], [DIM, INK]);
  return <motion.span style={{ color }}>{char}</motion.span>;
}

export default function StrideAbout() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.15"],
  });

  let letterIdx = 0;
  const words = text.split(" ");

  return (
    <section className="about section section--tight">
      <style>{`
        .about { font-family: var(--font-sans); }
        .about-inner { max-width: var(--maxw); margin: 0 auto; }
        .about-p {
          margin: 0;
          font-weight: var(--fw-bold);
          font-size: var(--fs-h1);
          line-height: var(--lh-h1);
          letter-spacing: var(--ls-h1);
          max-width: 22ch;
          color: var(--ink);
        }
      `}</style>

      <div className="about-inner">
        <p ref={ref} className="about-p">
          {reduced
            ? text
            : words.map((word, wi) => (
                <span key={wi}>
                  <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                    {word.split("").map((char, ci) => {
                      const i = letterIdx;
                      letterIdx += 1;
                      return (
                        <Letter
                          key={ci}
                          char={char}
                          index={i}
                          progress={scrollYProgress}
                        />
                      );
                    })}
                  </span>
                  {wi < words.length - 1 ? " " : ""}
                </span>
              ))}
        </p>
      </div>
    </section>
  );
}