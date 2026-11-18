"use client";

/**
 * The one check-in card for a session. Two ways in:
 *  - "nudge":   an AI intervention (Not now / its action), then the focus
 *               check, drift reason, or a break and "did that help?"
 *  - "checkin": the regular check every 20 minutes, straight to the focus check
 * Copy carried over from the old intervention and check-in pop-ups.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import "./session.css";
import BreakScreen from "./break-screen";

export type FocusState = "focused" | "drifting" | "lost";
export type DriftReason = "mind_wandering" | "feeling_stuck" | "tired" | "external";
export type BreakEffectiveness = "helped" | "somewhat" | "not_really";
export type Strategy = "take_break" | "switch_task" | "push_through" | "check_in";

export type NudgeFeedback = {
  action: "accepted" | "dismissed";
  focusState?: FocusState;
  driftReason?: DriftReason;
  breakEffectiveness?: BreakEffectiveness;
};

type Step = "intervention" | "focus_check" | "drift_reason" | "break" | "break_feedback";

const ACTION_LABEL: Record<Strategy, string> = {
  take_break: "Take break",
  switch_task: "Switch task",
  push_through: "Got it",
  check_in: "Got it",
};

const FOCUS: { value: FocusState; title: string; sub: string }[] = [
  { value: "focused", title: "Focused", sub: "I'm in the zone" },
  { value: "drifting", title: "Drifting", sub: "Mind's wandering a bit" },
  { value: "lost", title: "Lost", sub: "Can't focus at all" },
];
const REASONS: { value: DriftReason; label: string }[] = [
  { value: "mind_wandering", label: "Mind wandering" },
  { value: "feeling_stuck", label: "Feeling stuck" },
  { value: "tired", label: "Too tired" },
  { value: "external", label: "Distracted" },
];
const BREAK: { value: BreakEffectiveness; label: string }[] = [
  { value: "helped", label: "Yes, feeling refreshed" },
  { value: "somewhat", label: "Somewhat" },
  { value: "not_really", label: "Not really" },
];

export default function CheckCard(
  props:
    | {
        mode: "nudge";
        intervention: { id: string; message: string; strategy: Strategy };
        onFeedback: (f: NudgeFeedback) => void;
        onClose: () => void;
      }
    | {
        mode: "checkin";
        onCheckIn: (state: FocusState) => void;
        onClose: () => void;
      }
) {
  const [step, setStep] = useState<Step>(props.mode === "nudge" ? "intervention" : "focus_check");
  const [action, setAction] = useState<"accepted" | "dismissed" | null>(null);
  const [focus, setFocus] = useState<FocusState | null>(null);

  const finish = (data: Omit<NudgeFeedback, "action">) => {
    if (props.mode === "nudge") props.onFeedback({ action: action ?? "dismissed", ...data });
    props.onClose();
  };

  const pickFocus = (state: FocusState) => {
    if (props.mode === "checkin") {
      props.onCheckIn(state);
      props.onClose();
      return;
    }
    setFocus(state);
    if (state === "focused") finish({ focusState: state });
    else setStep("drift_reason");
  };

  if (step === "break") return <BreakScreen onComplete={() => setStep("break_feedback")} />;

  const strategy = props.mode === "nudge" ? props.intervention.strategy : "check_in";

  return (
    <motion.div
      className="check-card"
      role="dialog"
      aria-live="polite"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {props.mode === "checkin" && (
        <button className="app-icon-btn check-close" onClick={props.onClose} aria-label="Dismiss">
          <X size={15} strokeWidth={1.75} />
        </button>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          {step === "intervention" && props.mode === "nudge" && (
            <>
              <p className="check-msg">{props.intervention.message}</p>
              <div className="check-actions">
                <button
                  className="app-ghost-btn"
                  onClick={() => {
                    setAction("dismissed");
                    setStep("focus_check");
                  }}
                >
                  Not now
                </button>
                <button
                  className="app-cta"
                  onClick={() => {
                    setAction("accepted");
                    setStep(strategy === "take_break" ? "break" : "focus_check");
                  }}
                >
                  {ACTION_LABEL[strategy]}
                </button>
              </div>
            </>
          )}

          {step === "focus_check" && (
            <>
              <p className="check-q">
                {action === "dismissed" ? "No problem. How's your focus right now?" : "Quick check. How's your focus?"}
              </p>
              <div className="check-options">
                {FOCUS.map((f) => (
                  <button key={f.value} className="check-option" onClick={() => pickFocus(f.value)}>
                    <span className="check-option-title">{f.title}</span>
                    <span className="check-option-sub">{f.sub}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "drift_reason" && (
            <>
              <p className="check-q">What&apos;s pulling you away?</p>
              <p className="check-hint">This helps us learn your patterns</p>
              <div className="check-grid">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    className="check-option check-option--center"
                    onClick={() => finish({ focusState: focus!, driftReason: r.value })}
                  >
                    <span className="check-option-title">{r.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "break_feedback" && (
            <>
              <p className="check-q">Did that break help?</p>
              <div className="check-options">
                {BREAK.map((b) => (
                  <button key={b.value} className="check-option" onClick={() => finish({ breakEffectiveness: b.value })}>
                    <span className="check-option-title">{b.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
