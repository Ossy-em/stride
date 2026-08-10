"use client";

import Link from "next/link";
import Button from "./ui/button";

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

        /* ---- large organic background shape ---- */
        .hero-shape {
          position: absolute;
          top: 50%;
          left: 50%;
          /* Increased to 140vw to intentionally bleed off edges on mobile */
          width: 140vw;
          height: 140vw;
          max-width: 800px;
          max-height: 800px;
          z-index: 0;
          pointer-events: none;
          background-color: rgba(47, 86, 72, 0.15); 
          border-radius: 43% 57% 65% 35% / 45% 55% 45% 55%;
          transform: translate(-50%, -50%) rotate(0deg);
          animation: morphShape 18s ease-in-out infinite alternate;
        }

        @keyframes morphShape {
          0% {
            border-radius: 43% 57% 65% 35% / 45% 55% 45% 55%;
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(-50%, -50%) rotate(15deg) scale(1.05);
          }
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
          /* Reduced the floor of the clamp from 3rem to 2.25rem for mobile */
          font-size: clamp(2.25rem, 5vw + 1rem, 5.5rem); 
          line-height: 1.1; /* Slightly looser line-height for mobile wrapping */
          letter-spacing: -0.03em;
          color: var(--ink);
          max-width: 14ch;
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
          .hero-shape {
            /* Restores the contained shape layout on wider screens */
            width: 70vw;
            height: 70vw;
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
          .hero-shape { animation: none; }
        }
      `}</style>

      <div className="hero-shape" aria-hidden />

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