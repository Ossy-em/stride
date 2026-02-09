# Stride

An AI-powered focus companion that studies your work patterns and intervenes before you get distracted.

## What is Stride?

Most focus tools react after you've already lost concentration. Stride flips that. It learns how you work over time, spots patterns in when and why you lose focus, and sends context-aware nudges before it happens.

The more you use it, the smarter it gets.

## How It Works

Stride tracks signals from your focus sessions like time of day, task type, session duration, and how you've responded to past interventions. It feeds this data to Claude (via the Anthropic API) to:

- **Predict** when you're most likely to drift based on your personal patterns
- **Calculate** the best moment to intervene
- **Generate** nudges that are specific to what you're doing right now, not generic motivation quotes

Every intervention gets a quality check before it reaches you. Your responses (engaged, dismissed, or ignored) feed back into the system so predictions improve over time.

## Features

- **Pattern-based focus prediction** that adapts to your behavior
- **Dynamic intervention timing** based on session context
- **Intervention effectiveness tracking** with real-time feedback loops
- **A/B testing** to continuously improve nudge quality
- **Focus session dashboard** with trends, history, and pattern insights
- **Google OAuth** authentication
- **Full observability** via Opik integration across all AI calls

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14, TypeScript |
| Database & Auth | Supabase |
| AI | Anthropic SDK (Claude) |
| Observability | Opik SDK |
| Styling | Tailwind CSS |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- Anthropic API key
- Opik API key


## How Pattern Recognition Works

Stride doesn't just track whether you stayed focused. It builds a picture of your focus behavior over time.

For example, if you consistently lose concentration 25 minutes into deep work sessions in the afternoon, Stride picks that up. Next time you're in a similar session, it intervenes at minute 22 instead of waiting for you to zone out.

The pattern analysis runs through Claude as the reasoning engine, processing your accumulated session data to find trends and adjust intervention timing and messaging accordingly.

## Project Structure

```
stride/
├── app/                  # Next.js app router pages
├── components/           # React components
├── lib/                  # Core logic
│   ├── ai/               # Claude integration, prediction engine
│   ├── supabase/         # Database client and queries
│   └── opik/             # Observability and logging
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## License

MIT