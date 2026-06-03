"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const text =
  "Concentration is difficult to sustain and effortless to lose. The hours dissolve into distractions you hardly notice. Stride exists to safeguard your attention.";

// reveal granularity: transform this many letters per step
const CHUNK_SIZE = 5;

const letterCount = text.replace(/ /g, "").length;
const totalChunks = Math.ceil(letterCount / CHUNK_SIZE);

function Letter({
  char,
  chunk,
  progress,
}: {
  char: string;
  chunk: number;
  progress: MotionValue<number>;
}) {
  const start = chunk / totalChunks;
  const end = (chunk + 1) / totalChunks;
  const color = useTransform(progress, [start, end + (end - start)], ["#d4d4ce", "#000000"]);
  return <motion.span style={{ color }}>{char}</motion.span>;
}

export default function StrideAbout() {
  const ref = useRef<HTMLParagraphElement>(null);

  // track the PARAGRAPH, and finish the fill while it's still high on screen.
  // 0 when the paragraph top reaches 80% down the viewport;
  // 1 when the paragraph top reaches 30% down — well before it exits.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.15"],
  });

  let letterIdx = 0;
  const words = text.split(" ");

  return (
    <section
      className="w-full px-6 pt-12 pb-16 md:px-12 md:pt-20 md:pb-[140px] flex items-start"
      style={{ background: "#ffffff" }}
    >
      <p
        ref={ref}
        style={{
          fontFamily: "'Lora', serif",
          fontWeight: 600,
          fontSize: "clamp(28px, 4.2vw, 56px)",
          lineHeight: 1.0,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          maxWidth: "65%",
        }}
      >
        {words.map((word, wi) => (
          <span key={wi}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {word.split("").map((char, ci) => {
                const chunk = Math.floor(letterIdx / CHUNK_SIZE);
                letterIdx += 1;
                return (
                  <Letter
                    key={ci}
                    char={char}
                    chunk={chunk}
                    progress={scrollYProgress}
                  />
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </section>
  );
}