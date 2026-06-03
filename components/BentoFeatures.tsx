"use client";

const cards = [
  {
    index: "01",
    title: "Start a Session",
    body: "Begin a focused work session with a clear goal and timer. Stride helps you stay on track, reduce distractions, and build consistent deep work habits from start to finish.",
  },
  {
    index: "02",
    title: "Nudges",
    body: "Gentle reminders that keep you engaged when your attention starts to drift. Nudges help you refocus without interrupting your workflow or breaking momentum.",
  },
  {
    index: "03",
    title: "Smart Interventions",
    body: "Real-time support powered by your focus data and behavior patterns. As Stride learns how you work, it delivers personalized suggestions and timely interventions to help you overcome distractions, stay productive, and maintain momentum.",
  },
  {
    index: "04",
    title: "Your Focus Fingerprint",
    body: "A personalized view of your focus patterns, habits, strengths, and challenges. It helps you understand how you work best and improve productivity over time.",
  },
];

export default function StrideHowItWorks() {
  return (
    <section
      className="w-full px-6 pt-4 pb-16 md:px-12 md:pt-16 md:pb-[140px] flex flex-col"
      style={{ background: "#ffffff" }}
    >
      {/* Top statement — full width, Lora (hero font), slightly smaller */}
      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "clamp(22px, 2.8vw, 36px)",
          fontWeight: 500,
          lineHeight: 1.22,
          letterSpacing: "-0.02em",
          color: "#1a1a17",
          marginBottom: "64px",
        }}
      >
        Stride builds your focus fingerprint and uses it to help you stay on
        track, adapting to your unique rhythms. It learns from every session you
        run, capturing when you drift, what pulls you back, and how your
        attention moves across a day.
      </p>

      {/* Split row: 65% cards | 8% gap | 27% why-different */}
      <div className="flex flex-col md:flex-row md:flex-nowrap md:items-stretch" style={{ gap: "8%" }}>
        {/* LEFT — cards: 2 cols mobile, 4 cols desktop */}
        <div style={{ flexBasis: "65%", flexGrow: 0, flexShrink: 0, minWidth: 0 }}>
          <div
            className="stride-cards-grid"
            style={{
              display: "grid",
              borderTop: "0.5px solid #e6e6de",
              borderLeft: "0.5px solid #e6e6de",
            }}
          >
            <style>{`
              .stride-cards-grid { grid-template-columns: repeat(2, 1fr); }
              @media (min-width: 768px) {
                .stride-cards-grid { grid-template-columns: repeat(4, 1fr); }
              }
            `}</style>
            {cards.map((card) => (
              <div
                key={card.index}
                style={{
                  padding: "24px 22px 32px",
                  borderRight: "0.5px solid #e6e6de",
                  borderBottom: "0.5px solid #e6e6de",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Top row — number + title together */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontSize: "11px",
                      fontWeight: 300,
                      letterSpacing: "0.16em",
                      color: "#8a8a80",
                    }}
                  >
                    {card.index}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Lora', serif",
                      fontWeight: 500,
                      fontSize: "18px",
                      lineHeight: 1.2,
                      letterSpacing: "-0.01em",
                      color: "#1a1a17",
                    }}
                  >
                    {card.title}
                  </h3>
                </div>

                <p
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontSize: "15px",
                    fontWeight: 400,
                    lineHeight: 1.65,
                    color: "#5a5a50",
                  }}
                >
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — why we're different, 27%, hidden on mobile */}
        <div
          className="hidden md:flex"
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#8a8a80",
              marginBottom: "20px",
            }}
          >
            Why Stride is different
          </p>

          <p
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              lineHeight: 1.6,
              color: "#1a1a17",
              marginBottom: "18px",
            }}
          >
            Most focus tools run on a fixed timer. The same twenty-five minutes
            for everyone, no matter what you're doing.
          </p>

          <p
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "15px",
              fontWeight: 400,
              lineHeight: 1.65,
              color: "#5a5a50",
            }}
          >
            Stride reads the rhythm of your attention instead, stepping in when
            your focus actually starts to fray and getting sharper the longer
            you use it.
          </p>
        </div>
      </div>
    </section>
  );
}