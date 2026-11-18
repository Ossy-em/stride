/**
 * Shared layout for the legal pages (Privacy Policy, Terms).
 * Built on the landing design system: same dark ground, nav, type roles,
 * half-line grid and white hairlines, so these read as part of the site.
 *
 *   left half   title, last-updated date, contents (sticky on desktop)
 *   right half  intro and numbered sections on hairline dividers
 */

import Link from "next/link";
import { Logo } from "../ui/logo";
import Button from "../ui/button";
import Footer from "../footer";

export type LegalSection = {
  id: string;
  title: string;
  body: React.ReactNode;
};

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Pricing", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
];

export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="landing legal overflow-x-clip">
      <style>{`
        /* ---- nav: same as the landing hero nav ---- */
        .legal-nav-bar { box-shadow: inset 0 calc(-1 * var(--hair)) 0 var(--hair-color); }
        .legal-nav {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--s-5);
          max-width: calc(var(--maxw) + 2 * var(--gutter));
          margin: 0 auto;
          padding: var(--s-4) var(--gutter);
          font-family: var(--font-sans);
        }
        .legal-wordmark { display: inline-flex; color: var(--ink); text-decoration: none; }
        .legal-nav-links {
          display: none;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          gap: var(--s-6);
        }
        .legal-nav-links a {
          font-size: var(--fs-sm);
          color: var(--body);
          text-decoration: none;
          transition: color var(--dur) ease;
        }
        .legal-nav-links a:hover { color: var(--ink); }

        /* ---- body: half-line grid ---- */
        .legal-grid {
          display: grid;
          grid-template-columns: 1fr;
          row-gap: var(--head-gap);
        }
        .legal-aside .t-small { margin-top: var(--stack-sm); }

        .legal-toc { display: none; }
        .legal-toc ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .legal-toc a {
          font-size: var(--fs-sm);
          line-height: var(--lh-sm);
          color: var(--body);
          text-decoration: none;
          transition: color var(--dur) ease;
        }
        .legal-toc a:hover { color: var(--ink); }

        .legal-intro { padding-bottom: var(--stack-lg); }
        .legal-section {
          padding: var(--stack-lg) 0;
          box-shadow: inset 0 var(--hair) 0 var(--hair-color);
          scroll-margin-top: var(--stack-lg);
        }
        .legal-section > .t-subtitle { margin-bottom: var(--stack-sm); }
        .legal-section .t-heading { margin-bottom: var(--stack-xs); }
        .legal-section .t-body + .t-heading,
        .legal-section .t-body + .t-body { margin-top: var(--stack-md); }
        .legal-content .t-body { max-width: var(--measure-body); }
        .legal-content a { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 0.5px; }

        @media (min-width: 768px) {
          .legal-nav-links { display: flex; }
          .legal-grid { grid-template-columns: 1fr 1fr; column-gap: var(--grid-gap); }
          .legal-aside { position: sticky; top: var(--stack-lg); align-self: start; }
          .legal-toc { display: block; margin-top: var(--head-gap); }
        }
      `}</style>

      <div className="legal-nav-bar">
        <nav className="legal-nav">
          <Link href="/" className="legal-wordmark" aria-label="Stride home">
            <Logo size={20} />
          </Link>
          <div className="legal-nav-links">
            {navLinks.map((l) => (
              <a key={l.name} href={l.href}>
                {l.name}
              </a>
            ))}
          </div>
          <Button href="/sign-in" variant="solidLight" size="sm">
            Sign in
          </Button>
        </nav>
      </div>

      <section className="section">
        <div className="legal-grid l-inner">
          <aside className="legal-aside">
            <h1 className="t-title">{title}</h1>
            <p className="t-small">Last updated: {updated}</p>

            <nav className="legal-toc" aria-label="Contents">
              <ol>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="legal-content">
            <div className="legal-intro">{intro}</div>
            {sections.map((s) => (
              <section className="legal-section" id={s.id} key={s.id}>
                <h2 className="t-subtitle">{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </section>

      <div className="l-divider-wrap"><hr className="l-divider" /></div>
      <Footer />
    </main>
  );
}
