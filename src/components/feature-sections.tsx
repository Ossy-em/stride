"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, MotionValue } from "framer-motion";

const text =
  "Concentration is difficult to sustain and effortless to lose. The hours dissolve into distractions you hardly notice. Stride exists to safeguard your attention.";

// dark landing: letters fill from a faint grey to the light ink
const DIM = "#26282c";
const INK = "#f7f8f8";

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
    <section className="about section">
      <style>{`
        .about-p { max-width: 25em; text-wrap: pretty; }
      `}</style>

      <div className="l-inner">
        <p ref={ref} className="about-p t-title">
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