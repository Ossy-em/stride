"use client";

const navigation = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "mailto:hello@trystrideai.com" },
];

const legal = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

export default function StrideFooter() {
  return (
    <footer className="ft">
      <style>{`
        .ft {
          width: 100%;
          box-sizing: border-box;
          background: var(--field-1);
          border-radius: 32px 32px 0 0;
          overflow: hidden;
          padding: 36px var(--gutter) 18px;
          font-family: var(--font-sans);
        }

        /* ---- columns ---- */
        .ft-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px var(--s-5);
          margin-bottom: var(--s-6);
        }
        .ft-col-head {
          margin: 0 0 var(--s-4);
          font-size: var(--fs-sm);
          font-weight: var(--fw-semibold);
          line-height: 1.3;
          color: var(--on-dark);
        }
        .ft-statement {
          margin: 0 0 var(--s-3);
          font-size: var(--fs-sm);
          font-weight: var(--fw-regular);
          line-height: 1.45;
          color: var(--on-dark-body);
          max-width: 26ch;
        }
        .ft-statement:last-child { margin-bottom: 0; }

        .ft-list { display: flex; flex-direction: column; gap: 9px; }
        .ft-link {
          font-size: var(--fs-sm);
          font-weight: var(--fw-regular);
          line-height: 1.3;
          color: var(--on-dark-body);
          text-decoration: none;
          width: fit-content;
          transition: color var(--dur) ease;
        }
        .ft-link:hover { color: var(--on-dark); }
        .ft-link:focus-visible {
          outline: 2px solid var(--on-dark);
          outline-offset: 3px;
          border-radius: 2px;
        }

        /* ---- wordmark: flush left, fills the measure ---- */
        .ft-mark {
          display: block;
          margin: 0 0 -0.05em;
          font-family: var(--font-serif);
          font-weight: 700;
          font-size: clamp(80px, 30vw, 470px);
          line-height: 0.74;
          letter-spacing: -0.05em;
          white-space: nowrap;
          color: var(--on-dark);
          user-select: none;
        }

        /* ---- centred legal ---- */
        .ft-base {
          text-align: center;
          padding-top: var(--s-4);
          border-top: 0.5px solid var(--on-dark-rule);
          margin-top: var(--s-5);
        }
        .ft-base p {
          margin: 0;
          font-size: var(--fs-xs);
          font-weight: var(--fw-regular);
          line-height: 1.6;
          color: var(--on-dark-quiet);
        }

        @media (min-width: 768px) {
          .ft {
            border-radius: var(--radius-panel) var(--radius-panel) 0 0;
            padding: 44px var(--gutter) 20px;
          }
          .ft-cols {
            grid-template-columns: 1.4fr 1fr 1fr 1.3fr;
            gap: var(--s-7);
            margin-bottom: var(--s-7);
          }
          .ft-mark { font-size: clamp(80px, 28vw, 470px); }
        }

        @media (prefers-reduced-motion: reduce) { .ft-link { transition: none; } }
      `}</style>

      <div className="ft-cols">
        <div>
          <p className="ft-col-head">Focus intelligence</p>
          <p className="ft-statement">
            Most focus tools run on a fixed timer. Stride reads the rhythm of
            your attention instead.
          </p>
          <p className="ft-statement">It gets sharper the longer you use it.</p>
        </div>

        <div>
          <p className="ft-col-head">Navigation</p>
          <div className="ft-list">
            {navigation.map((l) => (
              <a className="ft-link" key={l.name} href={l.href}>
                {l.name}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="ft-col-head">Legal</p>
          <div className="ft-list">
            {legal.map((l) => (
              <a className="ft-link" key={l.name} href={l.href}>
                {l.name}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="ft-col-head">Contact</p>
          <div className="ft-list">
            <a className="ft-link" href="mailto:hello@trystrideai.com">
              hello@trystrideai.com
            </a>
          </div>
          <p className="ft-statement" style={{ marginTop: "14px" }}>
            Est. 2026 ©
          </p>
        </div>
      </div>

      <span className="ft-mark" aria-hidden>
        stride
      </span>

      <div className="ft-base">
        <p>© {new Date().getFullYear()} Stride. All rights reserved.</p>
      </div>
    </footer>
  );
}