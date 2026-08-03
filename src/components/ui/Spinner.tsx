"use client";

import * as React from "react";

/**
 * Stride loading spinner.
 *
 * A single mark that morphs between circle and rounded-square as it rotates,
 * shifting through the brand green ramp — echoing the session timer's
 * breathing ring rather than reading as a generic loader. Dependency-free.
 *
 * Usage:
 *   <Spinner />                          // md, on light
 *   <Spinner size="lg" label="Loading" />
 *   <Spinner tone="onDark" />            // for dark surfaces (session screen)
 */
type Size = "sm" | "md" | "lg";
type Tone = "onLight" | "onDark";

interface SpinnerProps {
  size?: Size;
  /** Optional caption shown beneath the mark. */
  label?: string;
  /** Match the surface it sits on. */
  tone?: Tone;
  className?: string;
}

const dims: Record<Size, number> = { sm: 20, md: 32, lg: 48 };
const labelSize: Record<Size, string> = { sm: "12px", md: "13px", lg: "15px" };

export function Spinner({
  size = "md",
  label,
  tone = "onLight",
  className,
}: SpinnerProps) {
  const px = dims[size];

  // ramp shifts with tone so it reads on either surface
  const ramp =
    tone === "onDark"
      ? { a: "#8aa89c", b: "#b4c5bd", c: "#dfe4e0", ring: "rgba(240,240,236,0.14)" }
      : { a: "#10221c", b: "#2f5648", c: "#48645b", ring: "rgba(16,34,28,0.10)" };

  const labelColor = tone === "onDark" ? "#8aa89c" : "#7c9389";

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: label ? "14px" : 0,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "relative",
          display: "inline-block",
          width: px,
          height: px,
        }}
      >
        {/* faint breathing ring — echoes the session timer */}
        <span
          style={{
            position: "absolute",
            inset: `-${Math.round(px * 0.28)}px`,
            borderRadius: "50%",
            border: `1px solid ${ramp.ring}`,
            animation: "strideSpinnerBreathe 3s ease-in-out infinite",
          }}
        />
        {/* the morphing mark */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            animation: "strideSpinnerMorph 3s ease-in-out infinite",
          }}
        />
      </span>

      {label ? (
        <span
          style={{
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            fontSize: labelSize[size],
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: labelColor,
          }}
        >
          {label}
        </span>
      ) : null}

      <style>{`
        @keyframes strideSpinnerMorph {
          0% {
            transform: scale(1) rotate(0deg);
            border-radius: 50%;
            background: ${ramp.a};
          }
          25% {
            transform: scale(0.88) rotate(90deg);
            border-radius: 32%;
            background: ${ramp.b};
          }
          50% {
            transform: scale(1.06) rotate(180deg);
            border-radius: 16%;
            background: ${ramp.c};
          }
          75% {
            transform: scale(0.88) rotate(270deg);
            border-radius: 32%;
            background: ${ramp.b};
          }
          100% {
            transform: scale(1) rotate(360deg);
            border-radius: 50%;
            background: ${ramp.a};
          }
        }
        @keyframes strideSpinnerBreathe {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.12); opacity: 0.3; }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="status"] span[aria-hidden] > span {
            animation-duration: 0s !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Spinner;