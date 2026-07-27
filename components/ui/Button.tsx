"use client";

import * as React from "react";
import Link from "next/link";

type Variant = "solid" | "outline" | "outlineLight";
type Size = "sm" | "md";

type BaseProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
};

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="btn-arrow">
    <path
      d="M3 8h10m-4-4 4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ children, variant = "solid", size = "md", href, className, ...props }, ref) => {
    const inner = (
      <>
        <span className="btn-fill" aria-hidden />
        <span className="btn-label">{children}</span>
        <span className="btn-swap" aria-hidden>
          <span>{children}</span>
          <Arrow />
        </span>
      </>
    );

    const shared = {
      className: `btn${className ? ` ${className}` : ""}`,
      "data-variant": variant,
      "data-size": size,
    };

    if (href) {
      const external = /^(mailto:|tel:|https?:)/.test(href);
      if (external) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            {...shared}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {inner}
          </a>
        );
      }
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          {...shared}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {inner}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={props.type ?? "button"}
        {...shared}
        {...props}
      >
        {inner}
      </button>
    );
  }
);
Button.displayName = "Button";

/**
 * Mount ONCE, near the root (app/layout.tsx), not per button.
 */
export function ButtonStyles() {
  return (
    <style>{`
      .btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 999px;
        border: 0.5px solid transparent;
        font-family: 'Geist', system-ui, -apple-system, sans-serif;
        font-weight: 500;
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        isolation: isolate;
      }
      .btn:focus-visible {
        outline: 2px solid var(--btn-focus);
        outline-offset: 3px;
      }

      .btn[data-size="sm"] { padding: 11px 20px; font-size: 13px; }
      .btn[data-size="md"] { padding: 13px 26px; font-size: 14px; }

      /* --- variants --- */
      .btn[data-variant="solid"] {
        --btn-bg: #10221c;
        --btn-fg: #f0f0ec;
        --btn-fill: #f0f0ec;
        --btn-fill-fg: #10221c;
        --btn-border: transparent;
        --btn-focus: #10221c;
      }
      .btn[data-variant="outline"] {
        --btn-bg: transparent;
        --btn-fg: #10221c;
        --btn-fill: #10221c;
        --btn-fill-fg: #f0f0ec;
        --btn-border: #dfe4e0;
        --btn-focus: #10221c;
      }
      .btn[data-variant="outlineLight"] {
        --btn-bg: transparent;
        --btn-fg: #f0f0ec;
        --btn-fill: #f0f0ec;
        --btn-fill-fg: #10221c;
        --btn-border: rgba(240, 240, 236, 0.32);
        --btn-focus: #f0f0ec;
      }

      .btn {
        background: var(--btn-bg);
        color: var(--btn-fg);
        border-color: var(--btn-border);
      }

      /* --- the expanding fill --- */
      .btn-fill {
        position: absolute;
        left: 10px;
        top: 50%;
        width: 7px;
        height: 7px;
        z-index: 0;
        border-radius: 999px;
        background: var(--btn-fill);
        transform: translateY(-50%) scale(1);
        transition: left 320ms cubic-bezier(0.22, 1, 0.36, 1),
                    top 320ms cubic-bezier(0.22, 1, 0.36, 1),
                    width 320ms cubic-bezier(0.22, 1, 0.36, 1),
                    height 320ms cubic-bezier(0.22, 1, 0.36, 1),
                    transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
      }
      .btn:hover .btn-fill,
      .btn:focus-visible .btn-fill {
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        transform: translateY(0) scale(1.6);
      }

      /* --- labels --- */
      .btn-label {
        position: relative;
        z-index: 1;
        display: inline-block;
        transition: transform 300ms ease, opacity 260ms ease;
      }
      .btn:hover .btn-label,
      .btn:focus-visible .btn-label {
        transform: translateX(38%);
        opacity: 0;
      }

      .btn-swap {
        position: absolute;
        inset: 0;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--btn-fill-fg);
        transform: translateX(34%);
        opacity: 0;
        transition: transform 300ms ease, opacity 260ms ease;
      }
      .btn:hover .btn-swap,
      .btn:focus-visible .btn-swap {
        transform: translateX(0);
        opacity: 1;
      }
      .btn-arrow { width: 16px; height: 16px; flex-shrink: 0; }

      .btn:active { transform: translateY(1px); }

      @media (prefers-reduced-motion: reduce) {
        .btn-fill, .btn-label, .btn-swap { transition: none; }
        .btn:hover .btn-label, .btn:focus-visible .btn-label { transform: none; }
        .btn:hover .btn-swap, .btn:focus-visible .btn-swap { transform: none; }
        .btn:active { transform: none; }
      }
    `}</style>
  );
}

export default Button;