# Stride

![Next.js 16.1.2](https://img.shields.io/badge/Next.js-16.1.2-2F5648?style=flat&logo=next.js&logoColor=white)

An AI-powered focus companion that learns when you drift and intervenes before you lose focus.

Overview
-
Stride is a small experimental product that investigates whether proactive, contextual interventions can help people maintain focus. Rather than reacting after attention is lost, Stride learns patterns from session data and predicts moments where a short, contextual nudge is most likely to help.

Problem
-
Most focus tools operate reactively: they notify you after you already lost concentration. Stride explores making interventions proactive by combining behavioural signals, timing heuristics, and a lightweight AI layer to decide whether — and how — to intervene.

How it works
-
At a high level, Stride collects signals from focus sessions, analyses patterns, predicts attention drift, then decides if and when to send a contextual intervention.

Key signals considered
- session duration
- time of day
- task/context metadata
- previous session behaviour
- prior intervention responses

Simplified flow
```text
Focus session
  → collect behaviour
  → analyse patterns
  → predict drift
  → choose intervention (if appropriate)
  → send AI-generated nudge
  → measure response and feed back into model
```

AI & intervention system
-
The AI layer is used selectively. Stride combines application logic and behavioural data with Claude (via the Anthropic SDK) for reasoning where it adds value:
- Pattern analysis and timing heuristics decide whether an intervention should be attempted.
- When an intervention is appropriate, the system constructs a contextual prompt and asks the model for wording and suggestions.
- The user response (engage, dismiss, ignore) is recorded as a behavioural signal and is used to tune future decisions.

Design and reliability considerations
- Prompt design: experiment with structure and wording to avoid generic "stay focused" notifications.
- Intervention timing: identifying the point where a nudge is helpful, not interruptive.
- Feedback loop: use engagement signals to improve timing and wording over time.
- Observability: model calls and behaviour are monitored via Opik to understand and improve AI behaviour.

Features
-
- Focus prediction: identifies when attention is likely to fade.
- Smart interventions: contextual nudges rather than generic messages.
- Intervention timing: heuristics plus model reasoning to choose moments that help.
- Focus fingerprint: an evolving profile of how a user tends to work.
- Session analytics: collect trends and behavioural patterns.
- Feedback loop: responses feed future decisions.
- AI observability: Opik integration for monitoring model behaviour.
- Web push notifications: deliver interventions during active sessions.

Tech stack (selected)
-
| Area | Technology |
|---|---|
| Framework | Next.js 16.1.2 |
| Language | TypeScript |
| UI | React 19.2.3 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Database | Supabase (@supabase/supabase-js ^2.95.3) |
| Auth | NextAuth |
| AI | Anthropic SDK (@anthropic-ai/sdk ^0.71.2) |
| AI observability | Opik (opik ^1.9.87) |
| Email | Resend (resend ^6.9.1) |
| Video / motion | Remotion |
| Push | web-push |

The versions above are taken from `package.json` in this repository.

Why I built Stride
-
I wanted to explore whether a focus product could respond to how people actually work instead of giving everyone identical reminders. That led to experiments in behavioural data, prompt design, intervention timing, and feedback loops — shifting the focus from "use an LLM everywhere" to "use AI where it helps." 

What I learned
-
- Prompt engineering and prompt structure matter for useful interventions.
- Behavioural data is critical to deciding when the model should be asked to respond.
- A working model response does not guarantee a good UX — deciding whether to respond at all is often the tougher problem.
- Observability for model calls (via Opik) helps diagnose and improve AI behaviour.

Project structure (top-level)
-
stride/
├── src/
│   ├── app/         # Next.js app routes and pages
│   ├── components/  # UI components
│   ├── lib/         # services and business logic (AI, auth, push, etc.)
│   ├── remotion/    # video/motion compositions
│   └── types/
├── public/
└── ...

Getting started
-
Prerequisites
- Node.js 18+
- Supabase project (for database & auth)
- Anthropic API key
- Opik API key (optional, for AI observability)

Quick install
```bash
git clone https://github.com/Ossy-em/stride.git
cd stride
npm install
```

Environment
Create a `.env.local` with the required variables (examples here):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Opik
OPIK_API_KEY=
```

Run the dev server
```bash
npm run dev
# open http://localhost:3000
```

Current status
-
Stride is an ongoing project and an experiment in intervention timing, prompt design, and behavioural feedback. I continue to iterate on prediction logic, intervention quality, and how responses feed back into the system.

Notes & next steps
-
- Adding real screenshots / GIFs for the dashboard, session UI, interventions, and analytics would strengthen the README.
- A small architecture diagram focused on data flow (session → analysis → timing → intervention) would help readers quickly grasp the system.

License
-
MIT
