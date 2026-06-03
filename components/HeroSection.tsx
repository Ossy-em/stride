"use client";

import { useRef, useState, useEffect } from "react";

// radius of the soft reveal circle (medium, Sonia-like)
const GLOW_RADIUS = 260;

// A dense field of soft organic "petals" spanning the hero width.
// Emerald palette, varied tone + opacity + rotation so it reads as artwork,
// not four gradient smudges. Rendered twice: dim base + bright (masked) layer.
type Petal = {
  cx: number; cy: number; rx: number; ry: number;
  rot: number; fill: string; o: number;
};

const petals: Petal[] = [
  { cx: 90,  cy: 250, rx: 120, ry: 60,  rot: -28, fill: "#5fae8e", o: 0.9 },
  { cx: 180, cy: 360, rx: 90,  ry: 150, rot: 18,  fill: "#3f8f6e", o: 0.8 },
  { cx: 250, cy: 230, rx: 80,  ry: 130, rot: -12, fill: "#7cc0a4", o: 0.85 },
  { cx: 340, cy: 320, rx: 110, ry: 70,  rot: 32,  fill: "#2f8f6e", o: 0.75 },
  { cx: 430, cy: 250, rx: 70,  ry: 120, rot: -22, fill: "#9ad0bb", o: 0.8 },
  { cx: 520, cy: 360, rx: 130, ry: 80,  rot: 14,  fill: "#4f9f85", o: 0.7 },
  { cx: 620, cy: 240, rx: 90,  ry: 140, rot: -18, fill: "#34d399", o: 0.78 },
  { cx: 720, cy: 330, rx: 100, ry: 65,  rot: 26,  fill: "#5fae8e", o: 0.72 },
  { cx: 810, cy: 250, rx: 75,  ry: 125, rot: -30, fill: "#2f8f6e", o: 0.8 },
  { cx: 900, cy: 350, rx: 120, ry: 75,  rot: 20,  fill: "#7cc0a4", o: 0.74 },
  { cx: 980, cy: 240, rx: 85,  ry: 135, rot: -14, fill: "#10b981", o: 0.7 },
  { cx: 1070,cy: 330, rx: 105, ry: 70,  rot: 28,  fill: "#4f9f85", o: 0.76 },
  { cx: 1160,cy: 250, rx: 80,  ry: 130, rot: -24, fill: "#9ad0bb", o: 0.78 },
  { cx: 1250,cy: 350, rx: 125, ry: 80,  rot: 16,  fill: "#3f8f6e", o: 0.7 },
  { cx: 1330,cy: 240, rx: 90,  ry: 140, rot: -20, fill: "#5fae8e", o: 0.76 },
  { cx: 1420,cy: 330, rx: 100, ry: 65,  rot: 30,  fill: "#34d399", o: 0.72 },
];

function PetalField({ opacity }: { opacity: number }) {
  return (
    <svg
      viewBox="0 0 1440 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      style={{ opacity }}
      aria-hidden
    >
      <defs>
        <filter id="petalBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <g filter="url(#petalBlur)">
        {petals.map((p, i) => (
          <ellipse
            key={i}
            cx={p.cx}
            cy={p.cy}
            rx={p.rx}
            ry={p.ry}
            fill={p.fill}
            opacity={p.o}
            transform={`rotate(${p.rot} ${p.cx} ${p.cy})`}
          />
        ))}
      </g>
    </svg>
  );
}


export default function StrideHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -1000, y: -1000 });
  const [inside, setInside] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const enter = () => setInside(true);
    const leave = () => setInside(false);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);

  // soft circular mask centered on the cursor — reveals the bright layer
  const maskValue = `radial-gradient(circle ${GLOW_RADIUS}px at ${pos.x}px ${pos.y}px, #000 0%, rgba(0,0,0,0.5) 45%, transparent 75%)`;

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col"
      style={{ background: "#ffffff" }}
    >
      {/* BASE LAYER — dim blobs, always visible */}
      <div className="absolute inset-0 z-[1]" style={{ pointerEvents: "none" }}>
        <PetalField opacity={0.18} />
      </div>

      {/* BRIGHT LAYER — revealed only inside the cursor glow */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          pointerEvents: "none",
          WebkitMaskImage: inside ? maskValue : "none",
          maskImage: inside ? maskValue : "none",
          opacity: inside ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        <PetalField opacity={1} />
      </div>

      {/* CUSTOM CURSOR — soft glow following the pointer */}
      <div
        className="absolute z-[5] rounded-full"
        style={{
          pointerEvents: "none",
          left: pos.x,
          top: pos.y,
          width: GLOW_RADIUS * 2,
          height: GLOW_RADIUS * 2,
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)",
          opacity: inside ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Top white mask */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 z-[2]"
        style={{ height: "130px", background: "#ffffff" }}
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2]"
        style={{
          height: "180px",
          background: "linear-gradient(to top, #ffffff 55%, transparent)",
        }}
      />

      {/* Side masks */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[2]"
        style={{
          width: "80px",
          background: "linear-gradient(to right, #ffffff 35%, transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[2]"
        style={{
          width: "80px",
          background: "linear-gradient(to left, #ffffff 35%, transparent)",
        }}
      />

      {/* Hero content — Sonia hierarchy: small wordmark, big message */}
      <div className="relative z-[4] flex flex-col items-center text-center flex-1 justify-center px-6">

        {/* stride — small brand label */}
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontWeight: 500,
            fontSize: "22px",
            color: "#1a1a17",
            letterSpacing: "-0.01em",
            marginBottom: "16px",
          }}
        >
          stride
        </p>

        {/* Message — the hero-sized statement */}
        <h1
          style={{
            fontFamily: "'Lora', serif",
            fontWeight: 500,
            fontSize: "clamp(40px, 6vw, 76px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#1a1a17",
            maxWidth: "900px",
            marginBottom: "28px",
          }}
        >
          Your AI focus companion that learns{" "}
          <em className="not-italic" style={{ color: "#1a7a52" }}>
            when
          </em>{" "}
          you drift
        </h1>

        {/* Tagline — muted */}
        <p
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "clamp(18px, 2vw, 22px)",
            fontWeight: 300,
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
            color: "#8a8a80",
            maxWidth: "520px",
            marginBottom: "44px",
          }}
        >
          It steps in before it happens, and gets sharper over time.
        </p>

        {/* CTA — standard button */}
        <button
          className="cursor-pointer transition-colors duration-500 hover:bg-[#0c2518]"
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "0.01em",
            color: "#ffffff",
            background: "#1a1a17",
            border: "none",
            padding: "11px 28px",
            borderRadius: "100px",
          }}
        >
          Start a session
        </button>

      </div>
    </section>
  );
}