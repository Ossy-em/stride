"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
];

const rail = [
  { index: "01", label: "Nudges" },
  { index: "02", label: "Smart interventions" },
  { index: "03", label: "Your focus fingerprint" },
];

export default function StrideHero() {
  return (
    <section className="hero">
      <style>{`
        .hero {
          position: relative;
          width: 100%;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          background: var(--ground);
          overflow: hidden;
          font-family: var(--font-sans);
        }

        /* ---- contained centre bloom ---- */
        .hero-field {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          filter: blur(70px);
          background:
            radial-gradient(28% 24% at 50% 44%, rgba(16, 34, 28, 0.55) 0%, transparent 72%),
            radial-gradient(42% 36% at 50% 46%, rgba(47, 86, 72, 0.50) 0%, transparent 76%),
            radial-gradient(58% 50% at 50% 48%, rgba(72, 100, 91, 0.36) 0%, transparent 80%);
          animation: fieldDrift 24s ease-in-out infinite alternate;
        }
        @keyframes fieldDrift {
          0%   { transform: scale(1) translate3d(0, 0, 0); }
          100% { transform: scale(1.06) translate3d(-1%, 1%, 0); }
        }

        /* ---- nav ---- */
        .hero-nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--s-5);
          padding: 22px var(--gutter);
        }
        .hero-wordmark {
          font-family: var(--font-serif);
          font-weight: var(--fw-semibold);
          font-size: 20px;
          letter-spacing: -0.02em;
          color: var(--ink);
          text-decoration: none;
        }
        .hero-nav-links { display: none; gap: 30px; }
        .hero-nav-links a {
          font-size: var(--fs-sm);
          font-weight: var(--fw-regular);
          color: var(--body);
          text-decoration: none;
          transition: color var(--dur) ease;
        }
        .hero-nav-links a:hover { color: var(--ink); }

        /* ---- main: centred column ---- */
        .hero-main {
          position: relative;
          z-index: 5;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--s-8) var(--gutter);
        }

        .hero-h1 {
          margin: 0 0 var(--s-5);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h1);
          line-height: var(--lh-h1);
          letter-spacing: var(--ls-h1);
          color: var(--ink);
          max-width: 16ch;
          text-wrap: balance;
        }

        .hero-sub {
          margin: 0 0 var(--s-7);
          font-size: var(--fs-lead);
          font-weight: var(--fw-regular);
          line-height: var(--lh-lead);
          letter-spacing: var(--ls-lead);
          color: var(--body);
          max-width: 42ch;
        }

        /* ---- bottom rail ---- */
        .hero-rail {
          position: relative;
          z-index: 10;
          border-top: 0.5px solid var(--rule);
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--s-3);
          padding: var(--s-5) var(--gutter);
        }
        .hero-rail-item {
          display: flex;
          align-items: baseline;
          gap: var(--s-3);
          font-size: var(--fs-sm);
          line-height: 1.3;
        }
        .hero-rail-item span { color: var(--quiet); font-variant-numeric: tabular-nums; }
        .hero-rail-item p { margin: 0; color: var(--ink); font-weight: var(--fw-medium); }

        @media (min-width: 768px) {
          .hero-field {
            filter: blur(90px);
            background:
              radial-gradient(22% 26% at 50% 46%, rgba(16, 34, 28, 0.58) 0%, transparent 72%),
              radial-gradient(34% 40% at 50% 48%, rgba(47, 86, 72, 0.52) 0%, transparent 76%),
              radial-gradient(48% 54% at 50% 50%, rgba(72, 100, 91, 0.38) 0%, transparent 80%);
          }

          .hero-nav { padding: 26px var(--gutter); }
          .hero-nav-links { display: flex; }

          .hero-rail {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--s-6);
            padding: var(--s-5) var(--gutter) var(--s-6);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-field { animation: none; }
        }
      `}</style>

      <div className="hero-field" aria-hidden />

      <nav className="hero-nav">
        <Link href="/" className="hero-wordmark">
          stride
        </Link>
        <div className="hero-nav-links">
          {navLinks.map((l) => (
            <a key={l.name} href={l.href}>
              {l.name}
            </a>
          ))}
        </div>
        <Button href="/signin" size="sm">
          Sign in
        </Button>
      </nav>

      <div className="hero-main">
        <h1 className="hero-h1">Your AI focus companion that learns when you drift.</h1>
        <p className="hero-sub">
          It steps in before it happens, and gets sharper over time.
        </p>
        <Button href="/signin" size="md">
          Start a session
        </Button>
      </div>

      <div className="hero-rail">
        {rail.map((r) => (
          <div className="hero-rail-item" key={r.index}>
            <span>{r.index}</span>
            <p>{r.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}