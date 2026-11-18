"use client";

/**
 * After a session: rate it, optionally add details, save (or discard),
 * then an optional note about the experience. Same requests as before.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Flame } from "lucide-react";
import "./session.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const duration = (m: number) => {
  if (m < 60) return `${m} minute${m !== 1 ? "s" : ""}`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h} hour${h > 1 ? "s" : ""}`;
};

const encouragement = (m: number) =>
  m >= 45
    ? "Deep work achieved. That's serious focus."
    : m >= 25
    ? "Solid session. You showed up and did the work."
    : m >= 15
    ? "Every minute counts. Progress is progress."
    : "You started. That's the hardest part.";

export default function SessionDone({
  sessionId,
  taskDescription,
  elapsedMinutes,
  currentStreak,
}: {
  sessionId: string;
  taskDescription: string;
  elapsedMinutes: number;
  currentStreak?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"rate" | "feedback">("rate");
  const [quality, setQuality] = useState(7);
  const [details, setDetails] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          actualDuration: elapsedMinutes,
          focusQuality: quality,
          distractionCount: distractions,
          outcome: outcome.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setStep("feedback");
    } catch {
      setError("Failed to save session. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    if (note.trim()) {
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: note.trim(), type: "post_session", sessionId, page: "/session/end" }),
        });
        setSent(true);
      } catch (e) {
        console.error("Feedback error:", e);
      }
    }
    setTimeout(() => router.push("/home"), note.trim() ? 1200 : 0);
  };

  return (
    <div className="done-page">
      <AnimatePresence mode="wait" initial={false}>
        {step === "rate" ? (
          <motion.div
            key="rate"
            className="done-col"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <span className="done-check" aria-hidden="true">
              <Check size={20} strokeWidth={2} />
            </span>
            <h1 className="done-title">Session complete</h1>
            <p className="done-sub">{encouragement(elapsedMinutes)}</p>

            <div className="app-list done-summary">
              <div className="app-row">
                <div className="app-row-main">
                  <span className="app-row-sub">You worked on</span>
                  <span className="app-row-title">{taskDescription}</span>
                </div>
                <span className="app-row-meta">{duration(elapsedMinutes)} of focus</span>
              </div>
              {!!currentStreak && currentStreak > 0 && (
                <div className="app-row" data-tone="good">
                  <Flame size={16} strokeWidth={1.75} />
                  <div className="app-row-main">
                    <span className="app-row-title">{currentStreak + 1}-day streak!</span>
                    <span className="app-row-sub">You&apos;re building momentum.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="done-block">
              <p className="done-label">How was your focus?</p>
              <div className="done-scale" role="radiogroup" aria-label="Focus rating">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    role="radio"
                    aria-checked={quality === n}
                    className="done-step"
                    onClick={() => setQuality(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="done-scale-ends">
                <span>Distracted</span>
                <span>Deep focus</span>
              </div>
            </div>

            <div className="done-block">
              <button className="done-more" aria-expanded={details} onClick={() => setDetails((d) => !d)}>
                <ChevronDown size={15} strokeWidth={1.75} />
                {details ? "Hide details" : "Add more details (optional)"}
              </button>
              {details && (
                <div className="done-details">
                  <label className="done-field">
                    <span>How many times did you get distracted?</span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={distractions}
                      onChange={(e) => setDistractions(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </label>
                  <label className="done-field">
                    <span>What did you accomplish?</span>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Quick notes on what you got done..."
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                    />
                  </label>
                </div>
              )}
            </div>

            {error && (
              <p className="home-note" data-tone="warn" role="alert">
                <span className="dot" />
                {error}
              </p>
            )}

            <div className="done-actions">
              <button
                className="app-ghost-btn"
                disabled={saving}
                onClick={() => (confirmDiscard ? router.push("/home") : setConfirmDiscard(true))}
                onBlur={() => setConfirmDiscard(false)}
              >
                {confirmDiscard ? "Discard without saving?" : "Discard"}
              </button>
              <button className="app-cta" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save & done"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            className="done-col"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {sent ? (
              <>
                <h1 className="done-title">Thanks!</h1>
                <p className="done-sub">Taking you Home...</p>
              </>
            ) : (
              <>
                <span className="done-check" aria-hidden="true">
                  <Check size={20} strokeWidth={2} />
                </span>
                <h1 className="done-title">Session saved!</h1>
                <p className="done-sub">Quick thought before you go?</p>
                <div className="app-composer done-note">
                  <textarea
                    rows={3}
                    autoFocus
                    aria-label="How was this experience?"
                    placeholder="Anything you liked, didn't like, or wish was different..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <div className="done-actions">
                  <button className="app-ghost-btn" onClick={() => router.push("/home")}>
                    Skip
                  </button>
                  <button className="app-cta" onClick={finish}>
                    {note.trim() ? "Send & continue" : "Continue"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
