"use client";

import Button from "./ui/Button";

const Bell = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="9" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M11 20h10m-9-1v-4.5a4 4 0 0 1 8 0V19m-5 3.5h2"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Spark = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="9" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M16 9c0 3.5 3.5 7 7 7-3.5 0-7 3.5-7 7 0-3.5-3.5-7-7-7 3.5 0 7-3.5 7-7Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

const Fingerprint = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="9" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M16 22.5v-6.75m-3.25 6v-6a3.25 3.25 0 0 1 6.5 0v6M9.5 20v-4.25a6.5 6.5 0 0 1 13 0V20"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

const columns = [
  {
    Icon: Bell,
    title: "Gentle nudges that keep you engaged",
    body: "Reminders arrive when your attention starts to drift, and bring you back without interrupting your workflow or breaking momentum.",
  },
  {
    Icon: Spark,
    title: "Real-time support that learns how you work",
    body: "Interventions are powered by your focus data and behavior patterns. As Stride learns how you work, it delivers personalized suggestions and timely interventions to help you overcome distractions and maintain momentum.",
  },
  {
    Icon: Fingerprint,
    title: "A personalized view of your focus patterns",
    body: "Your focus fingerprint gathers your patterns, habits, strengths, and challenges in one place. It helps you understand how you work best and improve productivity over time.",
  },
];

export default function StrideHowItWorks() {
  return (
    <section className="hiw section" id="how-it-works">
      <style>{`
        .hiw { font-family: var(--font-sans); }
        .hiw-inner { max-width: var(--maxw); margin: 0 auto; }

        .hiw-top {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--s-6);
          margin-bottom: var(--gap-header-content);
        }
        .hiw-heading {
          margin: 0;
          font-weight: var(--fw-bold);
          font-size: var(--fs-h2);
          line-height: var(--lh-h2);
          letter-spacing: var(--ls-h2);
          color: var(--ink);
          max-width: 20ch;
          text-wrap: balance;
        }

        .hiw-cols {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--s-7);
        }

        .hiw-col-icon {
          width: 32px;
          height: 32px;
          margin-bottom: var(--s-7);
          color: var(--ink);
        }
        .hiw-col-icon svg { width: 100%; height: 100%; display: block; }

        .hiw-col-title {
          margin: 0 0 var(--s-5);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h3);
          line-height: var(--lh-h3);
          letter-spacing: var(--ls-h3);
          color: var(--ink);
          max-width: 22ch;
        }
        .hiw-col-body {
          margin: 0;
          font-weight: var(--fw-regular);
          font-size: var(--fs-body);
          line-height: var(--lh-body);
          color: var(--body);
        }

        @media (min-width: 768px) {
          .hiw-top {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            gap: var(--s-7);
          }
          .hiw-cols { grid-template-columns: repeat(3, 1fr); gap: 4%; }
        }
      `}</style>

      <div className="hiw-inner">
        <div className="hiw-top">
          <h2 className="hiw-heading">
            Most focus tools run on a fixed timer. Stride reads the rhythm of
            your attention instead.
          </h2>
          <Button href="/signin" size="md">
            Start a session
          </Button>
        </div>

        <div className="hiw-cols">
          {columns.map(({ Icon, title, body }) => (
            <div key={title}>
              <div className="hiw-col-icon">
                <Icon />
              </div>
              <h3 className="hiw-col-title">{title}</h3>
              <p className="hiw-col-body">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}