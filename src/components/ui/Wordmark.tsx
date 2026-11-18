"use client";

import * as React from "react";

/**
 * Stride wordmark — the standalone brand word, Geist, capital S, matching
 * the logo lockup (components/ui/logo.tsx). Use this anywhere "Stride" appears as branding
 * (toasts, headers, empty states) instead of typing the word by hand.
 *
 * size: inherits by default; pass a token for common placements.
 */
type WordmarkProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  as?: "span" | "div" | "h1";
} & React.HTMLAttributes<HTMLElement>;

const sizes: Record<string, string> = {
  sm: "15px",
  md: "20px",
  lg: "28px",
};

export function Wordmark({ size = "md", className, as = "span", ...props }: WordmarkProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={`s-wordmark${className ? ` ${className}` : ""}`}
      style={{ fontSize: sizes[size] }}
      {...props}
    >
      Stride
    </Tag>
  );
}

export function WordmarkStyles() {
  return (
    <style>{`
      .s-wordmark {
        font-family: var(--font-geist-sans), 'Geist', system-ui, sans-serif;
        font-weight: 590;
        letter-spacing: -0.035em;
        line-height: 1;
        color: inherit;
        display: inline-block;
      }
    `}</style>
  );
}

export default Wordmark;