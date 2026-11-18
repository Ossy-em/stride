"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./ui/logo";
import Button from "./ui/button";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  // Pricing comes back with the pricing section (it's commented out on the page)
  { name: "FAQ", href: "#faq" },
];

export default function StrideHero() {
  // phone menu: full-screen sheet, page scroll locked while it's open
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section className="hero">
      <style>{`
        .hero {
          position: relative;
          width: 100%;
          padding-bottom: var(--section-y);
          background: var(--ground);
          overflow: hidden;
          font-family: var(--font-sans);
        }

        /* ---- nav: wordmark left, links centred, action right ---- */
        .hero-nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--s-5);
          max-width: calc(var(--maxw) + 2 * var(--gutter));
          margin: 0 auto;
          padding: var(--s-4) var(--gutter);
        }
        .hero-nav-bar { box-shadow: inset 0 calc(-1 * var(--hair)) 0 var(--hair-color); }
        .hero-wordmark {
          display: inline-flex;
          color: var(--ink);
          text-decoration: none;
        }
        .hero-nav-links {
          display: none;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          gap: var(--s-6);
        }
        .hero-nav-links a {
          font-size: var(--fs-sm);
          font-weight: var(--fw-regular);
          color: var(--body);
          text-decoration: none;
          transition: color var(--dur) ease;
        }
        .hero-nav-links a:hover { color: var(--ink); }

        /* ---- right side: phones get Linear's [Sign in] [pill] [menu] ---- */
        .hero-nav-right { display: flex; align-items: center; gap: 12px; }
        .hero-nav-login {
          font-size: 14px; white-space: nowrap; color: var(--body); text-decoration: none;
          transition: color var(--dur) ease;
        }
        .hero-nav-login:hover { color: var(--ink); }
        .hero-burger {
          width: 32px; height: 32px; margin-right: -6px;
          display: grid; place-items: center;
          border: 0; background: none; color: var(--ink); cursor: pointer;
        }
        .hero-burger > span { display: block; }
        .hero-burger > span > span {
          display: block; width: 18px; height: 1.5px; border-radius: 1px; background: currentColor;
          transition: transform 0.25s ease;
        }
        .hero-burger > span > span + span { margin-top: 5px; }
        .hero-burger[aria-expanded="true"] > span > span:first-child { transform: translateY(3.25px) rotate(45deg); }
        .hero-burger[aria-expanded="true"] > span > span:last-child { transform: translateY(-3.25px) rotate(-45deg); }
        .only-desk { display: none; }
        @media (max-width: 379px) { .hero-nav-right { gap: 8px; } .hero-nav { gap: var(--s-3); } }

        /* the sheet sits under the bar and covers the page */
        .hero-sheet {
          position: fixed; inset: 0; z-index: 2147483000; /* above the feedback button */
          display: flex; flex-direction: column;
          background: var(--ground);
          opacity: 0; visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s;
        }
        .hero-sheet[data-open="true"] { opacity: 1; visibility: visible; }
        .hero-sheet-links { list-style: none; margin: 0; padding: var(--s-2) var(--gutter) 0; }
        .hero-sheet-links a {
          display: block; padding: 16px 0;
          font-size: 20px; letter-spacing: -0.01em; color: var(--ink); text-decoration: none;
          box-shadow: inset 0 calc(-1 * var(--hair)) 0 var(--hair-color);
        }
        .hero-sheet-actions {
          margin-top: auto; display: grid; gap: 12px;
          padding: var(--gutter) var(--gutter) calc(var(--gutter) + env(safe-area-inset-bottom));
        }
        .hero-sheet-actions .btn { width: 100%; }

        /* ---- copy: Linear-style display heading + small supporting line ---- */
        .hero-copy {
          position: relative;
          z-index: 5;
          max-width: calc(var(--maxw) + 2 * var(--gutter));
          margin: 0 auto;
          padding: var(--s-10) var(--gutter) 0;
        }
        .hero-h1 {
          margin: 0;
          max-width: 8.4em;
          font-weight: var(--fw-heading);
          font-size: var(--fs-display);
          line-height: var(--lh-display);
          letter-spacing: var(--ls-display);
          color: var(--ink);
          text-wrap: balance;
        }
        .hero-sub {
          margin: var(--gap-display-sub) 0 0;
          max-width: 21em;
          text-wrap: balance;
          font-weight: var(--fw-regular);
          font-size: var(--fs-body);
          line-height: var(--lh-body);
          letter-spacing: var(--ls-body);
          color: var(--body);
        }
        .hero-actions {
          margin-top: var(--stack-md);
          display: flex;
          gap: var(--s-3);
        }

        /* ---- product film: mobile bleeds off the right edge,
                desktop overhangs the text column for more presence ---- */
        .hero-media {
          position: relative;
          z-index: 5;
          width: calc(100% - var(--gutter) + 1px);
          margin: var(--head-gap) 0 0 var(--gutter);
          border-radius: 0;
          border: 1px solid var(--panel-edge);
          border-top-color: var(--panel-edge-top);
          border-right: 0;
          overflow: hidden;
          background: #0b0b0c; /* the app's own ground */
          line-height: 0;
          /* the film fades into the page at the bottom, like Linear's hero */
          -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent 100%);
          mask-image: linear-gradient(to bottom, #000 62%, transparent 100%);
        }
        /* phones: a taller crop from the left so the app reads at a usable size */
        .hero-media video {
          display: block;
          width: 100%;
          height: auto;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          object-position: left top;
        }

        @media (min-width: 768px) {
          .hero-nav-links { display: flex; }
          .only-phone { display: none !important; }
          .only-desk { display: inline-flex; }
          .hero-sheet { display: none; }
          .hero-h1 { max-width: 16em; }
          .hero-copy { padding-top: 160px; }
          .hero-media {
            width: calc(100% - 2 * var(--gutter));
            max-width: calc(var(--maxw) + 96px);
            margin: var(--head-gap) auto 0;
            border-right: 1px solid var(--panel-edge);
          }
          .hero-media video { aspect-ratio: 1680 / 1050; object-fit: fill; }
        }
      `}</style>

      <div className="hero-nav-bar">
      <nav className="hero-nav">
        <Link href="/" className="hero-wordmark" aria-label="Stride home">
          <Logo size={20} />
        </Link>
        <div className="hero-nav-links">
          {navLinks.map((l) => (
            <a key={l.name} href={l.href}>
              {l.name}
            </a>
          ))}
        </div>
        <div className="hero-nav-right">
          <a href="/sign-in" className="hero-nav-login only-phone">
            Sign in
          </a>
          <span className="only-phone">
            <Button href="/sign-in" variant="solidLight" size="sm">
              Sign up
            </Button>
          </span>
          <span className="only-desk">
            <Button href="/sign-in" variant="solidLight" size="sm">
              Sign in
            </Button>
          </span>
          <button
            type="button"
            className="hero-burger only-phone"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="hero-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            <span>
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>
      </div>

      {/* phone menu */}
      <div id="hero-sheet" className="hero-sheet" data-open={open} aria-hidden={!open}>
        <div className="hero-nav-bar">
          <nav className="hero-nav">
            <Link href="/" className="hero-wordmark" aria-label="Stride home" onClick={() => setOpen(false)}>
              <Logo size={20} />
            </Link>
            <button
              type="button"
              className="hero-burger"
              aria-label="Close menu"
              aria-expanded={true}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
            >
              <span>
                <span />
                <span />
              </span>
            </button>
          </nav>
        </div>
        <ul className="hero-sheet-links">
          {navLinks.map((l) => (
            <li key={l.name}>
              <a href={l.href} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                {l.name}
              </a>
            </li>
          ))}
        </ul>
        <div className="hero-sheet-actions">
          <Button href="/sign-in" variant="outlineLight" size="md">
            Sign in
          </Button>
          <Button href="/sign-in" variant="solidLight" size="md">
            Sign up
          </Button>
        </div>
      </div>

      <div className="hero-copy">
        <h1 className="hero-h1">
          Your focus companion that learns when you drift.
        </h1>
        <p className="hero-sub">
          It steps in before it happens, and gets sharper over time.
        </p>
        <div className="hero-actions">
          <Button href="/sign-in" variant="solidLight" size="md">
            Sign up
          </Button>
        </div>
      </div>

      <div className="hero-media">
        <video
          src="/stride-hero.mp4"
          poster="/stride-hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Stride: starting a focus session from Home, then the live timer"
        />
      </div>
    </section>
  );
}
