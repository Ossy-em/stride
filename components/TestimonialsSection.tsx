"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Testimonial = {
  name: string;
  role: string;
  quote: string;        // plain text
  highlights: string[]; // substrings to emphasize
  wash: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Jordan",
    role: "Designer",
    quote: "Amazing product. Perfect for someone with ADHD.",
    highlights: ["Amazing product", "ADHD"],
    wash: "linear-gradient(145deg, #1f6f54, #2f8f6e)",
  },
  {
    name: "Sam",
    role: "Student",
    quote:
      "Stride has been an extremely helpful tool for my study sessions. Ever since I started using it, it's become my default focus app. Can't wait to see what's next.",
    highlights: ["extremely helpful", "default focus app"],
    wash: "linear-gradient(145deg, #3a7d8c, #5aa5b4)",
  },
  {
    name: "Riley",
    role: "Student",
    quote:
      "I love how the timer switches to a stopwatch once you go past your session limit. This is everything I've been looking for in a focus app, I'll be telling my friends about it.",
    highlights: ["switches to a stopwatch", "everything I've been looking for"],
    wash: "linear-gradient(145deg, #6b5e8c, #8b7db0)",
  },
];

// split a quote into parts, marking which segments should be highlighted
function renderQuote(quote: string, highlights: string[]) {
  if (highlights.length === 0) return quote;
  // build a regex that matches any highlight phrase
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = quote.split(re);
  return parts.map((part, i) => {
    const isHL = highlights.some((h) => h.toLowerCase() === part.toLowerCase());
    return isHL ? (
      <span key={i} style={{ color: "#10b981" }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    );
  });
}

function stackProps(pos: number) {
  if (pos === 0) return { x: 0, y: 0, rotate: -3, scale: 1, opacity: 1, zIndex: 50 };
  if (pos === 1) return { x: 30, y: 16, rotate: 4, scale: 0.97, opacity: 1, zIndex: 40 };
  if (pos === 2) return { x: 56, y: 32, rotate: -6, scale: 0.94, opacity: 1, zIndex: 30 };
  return { x: 80, y: 46, rotate: 8, scale: 0.91, opacity: 0, zIndex: 20 };
}

// L-shaped corner brackets — two perpendicular strokes, paper-colored
const BRACKET = "#d8d4c6";
function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base: React.CSSProperties = { position: "absolute", width: "18px", height: "18px" };
  const edge = `1px solid ${BRACKET}`;
  const map = {
    tl: { top: "7px", left: "7px", borderTop: edge, borderLeft: edge },
    tr: { top: "7px", right: "7px", borderTop: edge, borderRight: edge },
    bl: { bottom: "7px", left: "7px", borderBottom: edge, borderLeft: edge },
    br: { bottom: "7px", right: "7px", borderBottom: edge, borderRight: edge },
  } as const;
  return <span style={{ ...base, ...map[pos] }} />;
}

export default function StrideStories() {
  const [order, setOrder] = useState(testimonials.map((_, i) => i));
  const front = order[0];
  const active = testimonials[front];

  const next = () => setOrder((o) => [...o.slice(1), o[0]]);
  const prev = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);

  return (
    <section
      className="w-full px-6 py-16 md:px-12 md:py-[140px] md:min-h-0 flex flex-col md:justify-center"
      style={{ background: "#ffffff" }}
    >
      {/* Heading at top of section */}
      <p
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#8a8a80",
          marginBottom: "48px",
        }}
      >
        Stories from our community
      </p>

      {/* Panel — squared corners, paper border, L-brackets */}
      <div
        style={{
          position: "relative",
          background: "#10221c",
          border: "1px solid #d8d4c6",
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "72px 64px",
        }}
        className="flex flex-col md:flex-row md:items-center gap-12 md:gap-12"
      >
        <Bracket pos="tl" />
        <Bracket pos="tr" />
        <Bracket pos="bl" />
        <Bracket pos="br" />

        {/* LEFT — Polaroid stack (hidden on mobile) */}
        <div
          className="hidden md:flex md:flex-[0_0_46%]"
          style={{
            position: "relative",
            height: "440px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: "300px", height: "360px" }}>
            {order.map((tIndex, pos) => {
              const t = testimonials[tIndex];
              const p = stackProps(pos);
              return (
                <motion.div
                  key={tIndex}
                  animate={{
                    x: p.x,
                    y: p.y,
                    rotate: p.rotate,
                    scale: p.scale,
                    opacity: p.opacity,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 30 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: p.zIndex,
                    background: "#fdfdfb",
                    padding: "14px 14px 0",
                    borderRadius: "4px",
                    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "246px",
                      background: t.wash,
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: "72px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Caveat', cursive",
                        fontSize: "30px",
                        color: "#1a1a17",
                        lineHeight: 1,
                      }}
                    >
                      {t.name}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — quote */}
        <div className="flex-1" style={{ paddingTop: "8px" }}>
          <div
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "72px",
              lineHeight: 0.6,
              color: "#10b981",
              marginBottom: "24px",
              height: "40px",
            }}
          >
            &ldquo;
          </div>

          <motion.p
            key={front}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "clamp(20px, 2vw, 24px)",
              fontWeight: 600,
              lineHeight: 1.55,
              letterSpacing: "-0.01em",
              color: "#f0f0ec",
              maxWidth: "460px",
              marginBottom: "28px",
              minHeight: "150px",
            }}
          >
            {renderQuote(active.quote, active.highlights)}
          </motion.p>

          <motion.div
            key={`attr-${front}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "44px" }}
          >
            <span
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#f0f0ec",
              }}
            >
              {active.name}
            </span>
            <span
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "#6a8a7e",
              }}
            >
              {active.role}
            </span>
          </motion.div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={prev}
              aria-label="Previous"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "0.5px solid #2a4a3e",
                background: "transparent",
                color: "#cfe8df",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#16332a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              ←
            </button>
            <button
              onClick={next}
              aria-label="Next"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "none",
                background: "#10b981",
                color: "#06241a",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#0e9d70")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#10b981")}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}