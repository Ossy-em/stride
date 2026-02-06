**Stride**

Stride learns your focus patterns and intervenes before you drift.

---

**The Problem**

The average person loses 2 hours a day to unplanned distraction. That's 30 days a year. Gone.

Not because you're lazy. Because nothing warned you it was happening.

Focus apps today are reactive. They show you a report after the day is over. But that doesn't help. You already know you got distracted. You need something that warns you before it happens.

---

**The Solution**

Stride is a focus companion that builds your focus fingerprint.

During each session, Stride checks in at key moments. You tell it how you're feeling: focused, drifting, or lost. If you're struggling, you tap why: mind wandering, feeling stuck, tired, or distracted.

Over time, Stride learns your patterns. When you drift. Why you drift. What helps you recover.

Then it uses your focus fingerprint to intervene at the right moment. Before you lose focus. Not after.

---

**How It Works**

1. Start a focus session with a task and duration
2. Stride checks in at 20%, 50%, and 80% of your session
3. You give quick feedback on your focus state
4. Stride builds your focus fingerprint across sessions
5. Interventions become personalized to you

---

**Tech Stack**

- Next.js 14 (App Router)
- TypeScript
- Supabase (database and auth)
- Claude API (Haiku)
- Opik SDK for observability

---

**Opik Integration**

Stride uses Opik to track every AI interaction and measure what works.

What we log:
- Intervention generation (prompt, response, latency, tokens)
- Intervention outcomes (user action, focus state, drift reason)
- LLM-as-judge evaluations (helpfulness, timing, tone)
- Session summaries (acceptance rate, effectiveness rate)
- Pattern analysis with confidence scores

What we measure:
- A/B test performance across 9 message and timing combinations
- Intervention effectiveness by checkpoint
- Break effectiveness
- Focus state patterns by task type


---

**Screenshots**

[App session screen]

[Intervention with feedback flow]

[A/B testing dashboard]

[Opik traces]

---

**Live Demo**

[Your deployed URL]

---
