"use client";

import * as React from "react";

/**
 * Stride wordmark — the standalone brand word, Lora, lowercase, matching
 * the landing-page nav. Use this anywhere "Stride" appears as branding
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
      stride
    </Tag>
  );
}

export function WordmarkStyles() {
  return (
    <style>{`
      .s-wordmark {
        font-family: 'Lora', Georgia, serif;
        font-weight: 600;
        letter-spacing: -0.01em;
        line-height: 1;
        color: #1a1a17;
        display: inline-block;
      }
    `}</style>
  );
}

export default Wordmark;