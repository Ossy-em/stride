"use client";

/**
 * First-time intro, on the app design system (light and dark).
 * Five steps, copy unchanged. Where a step had a landing illustration it now
 * shows the real thing it describes: the in-session check card, a push
 * notification, the focus-by-day bars.
 *
 * The notifications step asks for permission when you tap its button, which
 * is the moment the copy says "when prompted". Finishing saves onboarded_at
 * and starts a first session; skipping saves it too and goes to Home.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { setupPushNotifications } from "@/lib/push-subscription";
import { Logo } from "@/components/ui/logo";
import "../app/session/session.css"; // check-card styles for the check visual
import "./onboarding.css";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---- visuals: the real UI, not drawings of it ---- */

// same options as the session check card
const FOCUS = [
  { title: "Focused", sub: "I'm in the zone" },
  { title: "Drifting", sub: "Mind's wandering a bit" },
  { title: "Lost", sub: "Can't focus at all" },
];

function CheckVisual() {
  return (
    <div className="ob-check" aria-hidden="true">
      <p className="check-q">Quick check. How&apos;s your focus?</p>
      <div className="check-options">
        {FOCUS.map((f, i) => (
          <span key={f.title} className="check-option" data-picked={i === 0 || undefined}>
            <span className="check-option-title">{f.title}</span>
            <span className="check-option-sub">{f.sub}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function NotifyVisual() {
  return (
    <div className="ob-notify" aria-hidden="true">
      <span className="ob-notify-icon">s</span>
      <span className="ob-notify-body">
        <span className="ob-notify-top">
          <strong>Stride</strong>
          <span>now</span>
        </span>
        <span className="ob-notify-msg">3 down. Settling in?</span>
      </span>
    </div>
  );
}

// the sample from the landing Fingerprint illustration
const DAYS = [
  { day: "Mon", score: 62 },
  { day: "Tue", score: 91, best: true },
  { day: "Wed", score: 70 },
  { day: "Thu", score: 48 },
];

function FingerprintVisual() {
  return (
    <div className="ob-fp" aria-hidden="true">
      {DAYS.map((d) => (
        <div key={d.day} className="ob-fp-row" data-best={d.best || undefined}>
          <span className="ob-fp-day">{d.day}</span>
          <span className="ob-fp-track">
            <span className="ob-fp-bar" style={{ width: `${d.score}%` }} />
          </span>
          <span className="ob-fp-score">{d.score}</span>
        </div>
      ))}
    </div>
  );
}

/* ---- flow ---- */

export default function OnboardingFlow({ userName }: { userName?: string }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState<null | "finish" | "skip">(null);
  const [error, setError] = useState<string | null>(null);

  const firstName = userName?.split(" ")[0] || "there";

  const steps = [
    {
      Visual: null,
      title: `Hey ${firstName}!`,
      subtitle: "Welcome to Stride",
      description:
        "Stride is your focus companion. It learns how you work and helps you stay locked in by predicting when you're about to lose focus.",
      buttonText: "Tell me more",
    },
    {
      Visual: CheckVisual,
      title: "It predicts, not reacts",
      subtitle: "How Stride works",
      description:
        "During a focus session, Stride sends a gentle check-in right before your focus typically drifts. The more you use it, the better it gets at knowing your rhythm.",
      buttonText: "What else?",
    },
    {
      Visual: NotifyVisual,
      title: "Stay in the zone",
      subtitle: "Even when you leave the app",
      description:
        "Stride sends push notifications so it can reach you even when you're in another app or your screen is off. When prompted, allow notifications for the best experience.",
      buttonText: "Got it",
      askPush: true,
    },
    {
      Visual: FingerprintVisual,
      title: "Your Focus Fingerprint",
      subtitle: "Unique to you",
      description:
        "After a few sessions, you'll unlock your Focus Fingerprint with personal insights about when you focus best, where you drift, and how you're improving.",
      buttonText: "One more thing",
    },
    {
      Visual: null,
      title: "You're all set",
      subtitle: "Let's get focused",
      description:
        "Start your first session and Stride will begin learning your patterns. Got feedback? Use the feedback button anytime to let us know what you think.",
      buttonText: "Start focusing →",
    },
  ];

  const last = step === steps.length - 1;
  const current = steps[step];

  const complete = useCallback(
    async (mode: "finish" | "skip") => {
      setSaving(mode);
      setError(null);
      try {
        const res = await fetch("/api/user/onboarding", { method: "POST" });
        if (!res.ok) throw new Error();
        router.replace(mode === "finish" ? "/session/start" : "/home");
      } catch {
        setSaving(null);
        setError("Couldn't save your progress. Try again.");
      }
    },
    [router]
  );

  // Ask inside the tap (browsers only show the prompt on a user gesture),
  // then subscribe in the background. Never blocks moving on.
  const askPush = () => {
    try {
      if (typeof Notification === "undefined" || Notification.permission !== "default") return;
      Notification.requestPermission()
        .then((p) => {
          if (p === "granted") setupPushNotifications().catch(() => {});
        })
        .catch(() => {});
    } catch {}
  };

  const next = useCallback(() => {
    if (saving) return;
    if (last) complete("finish");
    else setStep((s) => s + 1);
  }, [last, saving, complete]);

  const back = useCallback(() => {
    if (!saving) setStep((s) => Math.max(0, s - 1));
  }, [saving]);

  // keyboard: right/enter = next, left = back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "BUTTON" || tag === "A") return; // let focused controls handle themselves
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  return (
    <main className="ob">
      <header className="ob-bar">
        <span className="ob-wordmark" aria-label="Stride"><Logo size={18} /></span>
        {!last && (
          <button className="ob-skip" onClick={() => complete("skip")} disabled={saving !== null}>
            {saving === "skip" ? "Skipping…" : "Skip intro"}
          </button>
        )}
      </header>

      <section className="ob-stage">
        <div className="ob-col">
          <div
            className="ob-progress"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={step + 1}
            aria-label={`Step ${step + 1} of ${steps.length}`}
          >
            {steps.map((_, i) => (
              <span key={i} data-state={i === step ? "current" : i < step ? "done" : "todo"} />
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              className="ob-step"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {current.Visual && (
                <div className="ob-visual">
                  <current.Visual />
                </div>
              )}
              <p className="ob-kicker">{current.subtitle}</p>
              <h1 className="ob-title">{current.title}</h1>
              <p className="ob-body">{current.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="ob-actions">
            {step > 0 && (
              <button className="app-icon-btn ob-back" onClick={back} disabled={saving !== null} aria-label="Back">
                <ArrowLeft size={16} strokeWidth={1.75} />
              </button>
            )}
            <button
              className="app-cta ob-next"
              onClick={() => {
                if (current.askPush) askPush();
                next();
              }}
              disabled={saving !== null}
            >
              {saving === "finish" ? "Starting…" : current.buttonText}
            </button>
          </div>
          {error && (
            <p className="ob-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
