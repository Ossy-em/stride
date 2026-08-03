"use client";

import * as React from "react";

/**
 * Stride Card — the one card primitive. Borderless by design.
 *
 * Surfaces match the landing page: white card on a tinted ground, held by
 * a soft shadow for lift rather than an outline. No border, ever.
 *
 * tone:
 *   - "raised"  (default) white surface + soft shadow — the standard card
 *   - "flat"    white surface, no shadow — for cards on their own ground
 *   - "inset"   faint tinted fill — nested blocks, stat tiles
 *   - "dark"    deep green surface, light ink — accent / highlight cards
 *
 * pad: t-shirt padding, or false for none (media, custom layouts).
 */
type Tone = "raised" | "flat" | "inset" | "dark";
type Pad = "sm" | "md" | "lg" | false;

type CardProps = {
  children: React.ReactNode;
  tone?: Tone;
  pad?: Pad;
  /** Hairline edge — for cards on a white/untinted ground where shadow alone won't read. */
  bordered?: boolean;
  as?: "div" | "article" | "section" | "li";
  className?: string;
} & React.HTMLAttributes<HTMLElement>;

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ children, tone = "raised", pad = "md", bordered = false, as = "div", className, ...props }, ref) => {
    const Tag = as as React.ElementType;
    return (
      <Tag
        ref={ref}
        className={`s-card${className ? ` ${className}` : ""}`}
        data-tone={tone}
        data-pad={pad === false ? "none" : pad}
        data-bordered={bordered ? "true" : undefined}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
Card.displayName = "Card";

/** Mount ONCE near the root, with the other primitive styles. */
export function CardStyles() {
  return (
    <style>{`
      .s-card {
        border-radius: 16px;
        overflow: hidden;
        /* NO border — clean by design */
      }
      .s-card[data-tone="raised"] {
        background: #ffffff;
        box-shadow: 0 1px 2px rgba(16, 34, 28, 0.04),
                    0 12px 32px rgba(16, 34, 28, 0.06);
      }
      .s-card[data-tone="flat"] {
        background: #ffffff;
      }
      .s-card[data-tone="inset"] {
        background: #f4f7f2;
      }
      .s-card[data-tone="dark"] {
        background: #10221c;
        color: #f0f0ec;
      }

      /* hairline edge for cards on a white ground */
      .s-card[data-bordered="true"] {
        border: 0.5px solid #e6ebe8;
        box-shadow: 0 1px 2px rgba(16, 34, 28, 0.03),
                    0 20px 48px rgba(16, 34, 28, 0.08);
      }

      .s-card[data-pad="sm"] { padding: 16px; }
      .s-card[data-pad="md"] { padding: 24px; }
      .s-card[data-pad="lg"] { padding: 32px; }
      .s-card[data-pad="none"] { padding: 0; }

      @media (min-width: 768px) {
        .s-card[data-pad="md"] { padding: 28px; }
        .s-card[data-pad="lg"] { padding: 40px; }
      }
    `}</style>
  );
}

export default Card;