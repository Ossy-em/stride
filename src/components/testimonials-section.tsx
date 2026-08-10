"use client";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  highlights: string[];
  wash: string;
};


const testimonials: Testimonial[] = [
  {
    name: "Jordan",
    role: "Designer",
    quote:
      "Amazing product. Perfect for someone with ADHD. Most timers assume you can just decide to concentrate, and when I lose the thread there's nothing there to catch it. Stride actually notices and pulls me back before I've lost the whole afternoon.",
    highlights: ["Amazing product", "ADHD", "pulls me back"],
    wash: "#dce8e1",
  },
  {
    name: "Sam",
    role: "Student",
    quote:
      "Stride has been an extremely helpful tool for my study sessions. Ever since I started using it, it's become my default focus app. Can't wait to see what's next.",
    highlights: ["extremely helpful", "default focus app"],
    wash: "#cfe0d7",
  },
  {
    name: "Riley",
    role: "Student",
    quote:
      "I love how the timer switches to a stopwatch once you go past your session limit. This is everything I've been looking for in a focus app, I'll be telling my friends about it.",
    highlights: ["switches to a stopwatch", "everything I've been looking for"],
    wash: "#e2ebe5",
  },
  {
    name: "Tobi",
    role: "Software Engineer",
    quote:
      "The nudges are the part I didn't expect to like. They arrive when I've actually drifted rather than on a fixed schedule, so they never land as an interruption. A few weeks in and I'm running longer sessions without forcing it.",
    highlights: ["actually drifted", "never land as an interruption"],
    wash: "#d5e3dc",
  },
  {
    name: "Mara",
    role: "PhD Researcher",
    quote:
      "I started using it to get through writing days and stayed for the focus fingerprint. Seeing which hours I genuinely hold attention changed how I plan the week. It's the first tool that told me something about how I work that I didn't already know.",
    highlights: ["focus fingerprint", "changed how I plan the week"],
    wash: "#c9dcd3",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase();
}

function renderQuote(quote: string, highlights: string[]) {
  if (highlights.length === 0) return quote;
  const escaped = highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  return quote.split(re).map((part, i) => {
    const isHL = highlights.some((h) => h.toLowerCase() === part.toLowerCase());
    return isHL ? (
      <strong key={i} className="st-hl">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    );
  });
}

function Card({ t }: { t: Testimonial }) {
  return (
    <article className="st-card" style={{ ["--wash" as string]: t.wash }}>
      <p className="st-quote">{renderQuote(t.quote, t.highlights)}</p>
      <div className="st-person">
        <span className="st-avatar" aria-hidden>
          {initials(t.name)}
        </span>
        <span className="st-meta">
          <span className="st-name">{t.name}</span>
          <span className="st-role">{t.role}</span>
        </span>
      </div>
    </article>
  );
}

export default function StrideStories() {
  const cols = [
    [testimonials[0], testimonials[3]],
    [testimonials[1], testimonials[4]],
    [testimonials[2]],
  ];

  return (
    <section className="st section">
      <style>{`
        .st { font-family: var(--font-sans); }

        .st-heading {
          margin: 0 0 var(--gap-header-content);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h2);
          line-height: var(--lh-h2);
          letter-spacing: var(--ls-h2);
          color: var(--ink);
          max-width: 18ch;
        }

        .st-cols {
          display: flex;
          flex-direction: column;
          gap: var(--gap-grid);
          max-width: var(--maxw);
          margin: 0 auto;
        }
        .st-col { display: flex; flex-direction: column; gap: var(--gap-grid); }

        .st-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: var(--s-7);
          min-height: 268px;
          padding: var(--s-5) var(--s-5) var(--s-5);
          border-radius: var(--radius-card);
          border: 0.5px solid var(--edge);
          background: linear-gradient(180deg, var(--surface) 32%, var(--wash) 100%);
          box-shadow: 0 14px 34px rgba(16, 34, 28, 0.07);
        }

        .st-quote {
          margin: 0;
          font-size: var(--fs-body);
          font-weight: var(--fw-regular);
          line-height: 1.52;
          letter-spacing: -0.004em;
          color: var(--body);
        }
        .st-hl { font-weight: var(--fw-semibold); color: var(--ink); }

        .st-person { display: flex; align-items: center; gap: var(--s-3); }
        .st-avatar {
          flex-shrink: 0;
          width: 36px; height: 36px;
          border-radius: var(--radius-pill);
          background: var(--ink);
          color: var(--on-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--fs-sm);
          font-weight: var(--fw-semibold);
        }
        .st-meta { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .st-name { font-size: 14px; font-weight: var(--fw-semibold); color: var(--ink); line-height: 1.3; }
        .st-role { font-size: var(--fs-sm); font-weight: var(--fw-regular); color: var(--body); line-height: 1.3; }

        @media (min-width: 900px) {
          .st-cols { flex-direction: row; align-items: flex-start; gap: var(--s-5); }
          .st-col { flex: 1 1 0; gap: var(--s-5); min-width: 0; }
          .st-col:nth-child(2) { margin-top: var(--s-8); }
          .st-card { padding: var(--s-6) var(--s-5) var(--s-5); min-height: 292px; }
        }
      `}</style>

      <h2 className="st-heading">Stories from our community</h2>

      <div className="st-cols">
        {cols.map((col, i) => (
          <div className="st-col" key={i}>
            {col.map((t) => (
              <Card t={t} key={t.name} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}