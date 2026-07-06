"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function StrideHero() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isDocked, setIsDocked] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePos({ x, y });

      // Check distance to center ring 
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dist = Math.hypot(x - centerX, y - centerY);

      // If cursor gets within 35px of the center ring, snap it
      if (dist < 35) {
        setIsDocked(true);
      } else {
        setIsDocked(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center px-6 select-none"
      style={{ background: "#ffffff", cursor: "default" }}
    >
      {/* 1. THE SWISS HORIZON LAYER */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        {/* The Horizon Line */}
        <div
          className="absolute w-full h-[1px] transition-colors duration-500"
          style={{ background: isDocked ? "rgba(16, 185, 129, 0.4)" : "#f0f0ec" }}
        />

        {/* The Center Docking Ring */}
        <div
          className={`absolute w-4 h-4 rounded-full border transition-all duration-300 ${
            isDocked
              ? "border-[#10b981] bg-[#10b981]/10 scale-125 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              : "border-[#dcdce0] bg-white"
          }`}
        />
      </div>

      {/* 2. THE MINIMALIST CURSOR */}
      <div
        className="pointer-events-none absolute z-[50] transition-all duration-75 hidden md:block"
        style={{
          left: isDocked ? "50%" : `${mousePos.x}px`,
          top: isDocked ? "50%" : `${mousePos.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className={`rounded-full bg-[#10b981] transition-all duration-200 ${
            isDocked ? "w-2.5 h-2.5 animate-pulse" : "w-1.5 h-1.5"
          }`}
        />
      </div>

      {/* 3. YOUR EXACT TYPOGRAPHY & COPY */}
      <div className="relative z-[4] flex flex-col items-center text-center pointer-events-none">
        
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
          <em 
            className="not-italic transition-colors duration-300" 
            style={{ color: isDocked ? "#10b981" : "#1a7a52" }}
          >
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
        <div className="pointer-events-auto">
          <Link href="/signin">
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
          </Link>
        </div>

      </div>
    </section>
  );
}
