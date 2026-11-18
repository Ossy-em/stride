"use client";

import * as React from "react";
import Link from "next/link";

type Variant = "solid" | "outline" | "outlineLight" | "solidLight";
type Size = "sm" | "md";

type BaseProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  /** Leading icon (e.g. a lucide icon element). Sits before the label. */
  icon?: React.ReactNode;
  /** Shows a spinner and blocks interaction. */
  loading?: boolean;
  /** No-op since the redesign (there is no hover label swap). */
  noSwap?: boolean;
};

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>;

const Spinner = () => (
  <svg className="btn-spinner" viewBox="0 0 24 24" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="44"
      strokeDashoffset="14"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  (
    {
      children,
      variant = "solid",
      size = "md",
      href,
      className,
      icon,
      loading = false,
      noSwap = false,
      disabled,
      ...props
    },
    ref
  ) => {
    void noSwap; // kept for API compatibility; the redesign has no label swap

    const inner = (
      <>
        {loading ? (
          <Spinner />
        ) : icon ? (
          <span className="btn-icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="btn-label">{children}</span>
      </>
    );

    const shared = {
      className: `btn${className ? ` ${className}` : ""}`,
      "data-variant": variant,
      "data-size": size,
    };

    if (href && !disabled && !loading) {
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
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...shared}
        {...props}
      >
        {inner}
      </button>
    );
  }
);
Button.displayName = "Button";

/** Mount ONCE, near the root (app/layout.tsx), not per button. */
export function ButtonStyles() {
  return (
    <style>{`
      /* Linear-style pills: flat fills, hairline edges, quick quiet hovers */
      .btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        border-radius: 999px;
        border: 1px solid var(--btn-border);
        background: var(--btn-bg);
        color: var(--btn-fg);
        font-family: var(--font-geist-sans), 'Geist', system-ui, -apple-system, sans-serif;
        font-weight: 510;
        letter-spacing: -0.01em;
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;
        cursor: pointer;
        transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
      }
      .btn:hover:not(:disabled) { background: var(--btn-bg-hover); border-color: var(--btn-border-hover); }
      .btn:active:not(:disabled) { transform: scale(0.98); }
      .btn:focus-visible { outline: 2px solid var(--btn-focus); outline-offset: 2px; }
      .btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .btn[data-size="sm"] { height: 32px; padding: 0 14px; font-size: 13px; }
      .btn[data-size="md"] { height: 40px; padding: 0 18px; font-size: 14px; }

      /* on dark grounds */
      .btn[data-variant="solidLight"] {
        --btn-bg: #e6e7e8; --btn-bg-hover: #ffffff; --btn-fg: #08090a;
        --btn-border: transparent; --btn-border-hover: transparent; --btn-focus: #6fdc9c;
      }
      .btn[data-variant="outlineLight"] {
        --btn-bg: rgba(255, 255, 255, 0.04); --btn-bg-hover: rgba(255, 255, 255, 0.08); --btn-fg: #f7f8f8;
        --btn-border: rgba(255, 255, 255, 0.1); --btn-border-hover: rgba(255, 255, 255, 0.18); --btn-focus: #6fdc9c;
        border-top-color: rgba(255, 255, 255, 0.16);
      }
      /* on light grounds */
      .btn[data-variant="solid"] {
        --btn-bg: #08090a; --btn-bg-hover: #1f2023; --btn-fg: #f7f8f8;
        --btn-border: transparent; --btn-border-hover: transparent; --btn-focus: #08090a;
      }
      .btn[data-variant="outline"] {
        --btn-bg: transparent; --btn-bg-hover: rgba(0, 0, 0, 0.04); --btn-fg: #08090a;
        --btn-border: rgba(0, 0, 0, 0.12); --btn-border-hover: rgba(0, 0, 0, 0.2); --btn-focus: #08090a;
      }

      .btn-icon { display: inline-flex; }
      .btn-icon svg { width: 16px; height: 16px; display: block; }
      .btn-label { display: inline-block; }
      .btn-spinner { width: 16px; height: 16px; animation: btn-spin 0.7s linear infinite; }
      @keyframes btn-spin { to { transform: rotate(360deg); } }

      @media (prefers-reduced-motion: reduce) {
        .btn { transition: none; }
        .btn:active:not(:disabled) { transform: none; }
        .btn-spinner { animation: none; }
      }
    `}</style>
  );
}

export default Button;
