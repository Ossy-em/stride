"use client";

import Button from "./ui/button";
import {
  DriftIllustration,
  LayersIllustration,
  RhythmIllustration,
  HiwIllustrationStyles,
} from "./illustrations/hiw-illustrations";

const columns = [
  {
    Illo: DriftIllustration,
    title: "Gentle nudges that keep you engaged",
    body: "Reminders arrive when your attention starts to drift, and bring you back without breaking momentum.",
  },
  {
    Illo: LayersIllustration,
    title: "Real-time support that learns how you work",
    body: "As Stride learns how you work, it delivers personalized suggestions and timely interventions.",
  },
  {
    Illo: RhythmIllustration,
    title: "A personalized view of your focus patterns",
    body: "Your focus fingerprint maps your patterns and habits, so you understand how you work best.",
  },
];

export default function StrideHowItWorks() {
  return (
    <section className="hiw section" id="how-it-works">
      <HiwIllustrationStyles />
      <style>{`
        .hiw-cols {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--head-gap);
        }
        .hiw-illo { margin-bottom: var(--stack-md); aspect-ratio: 4 / 3; max-height: 260px; }
        .hiw-col .t-heading { margin-bottom: var(--stack-xs); }

        @media (min-width: 768px) {
          .hiw-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--col-gap); }
          /* fixed stage so the three titles share a baseline */
          .hiw-illo { height: 240px; aspect-ratio: auto; }
        }
      `}</style>

      <div className="l-inner">
        <header className="l-head l-head--wide">
          <h2 className="t-title">
            Most focus tools run on a fixed timer.{" "}
            <span className="t-title-muted">
              Stride reads the rhythm of your attention instead.
            </span>
          </h2>
          <div className="l-action">
            <Button href="/sign-in" variant="solidLight" size="md">
              Start a session
            </Button>
          </div>
        </header>

        <div className="hiw-cols">
          {columns.map(({ Illo, title, body }) => (
            <div className="hiw-col" key={title}>
              <div className="hiw-illo">
                <Illo />
              </div>
              <h3 className="t-heading">{title}</h3>
              <p className="t-body">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
