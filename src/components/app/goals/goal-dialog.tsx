"use client";

/** Create or edit a goal: title, optional target hours, optional due date. */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Goal } from "@/types";

export type GoalInput = { title: string; targetMinutes: number | null; dueDate: string | null };

export default function GoalDialog({
  goal,
  onClose,
  onSave,
  onDelete,
  onToggleDone,
}: {
  goal: Goal | null;
  onClose: () => void;
  onSave: (input: GoalInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onToggleDone?: () => Promise<void>;
}) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [target, setTarget] = useState(goal?.targetMinutes ? String(Math.round((goal.targetMinutes / 60) * 10) / 10) : "");
  const [due, setDue] = useState(goal?.dueDate ?? "");
  const [busy, setBusy] = useState<null | "save" | "delete" | "done">(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const run = async (kind: "save" | "delete" | "done", fn: () => Promise<void>) => {
    setBusy(kind);
    setError(false);
    try {
      await fn();
      onClose();
    } catch {
      setError(true);
      setBusy(null);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    const h = parseFloat(target);
    run("save", () =>
      onSave({
        title: title.trim(),
        targetMinutes: !isNaN(h) && h > 0 ? Math.round(h * 60) : null,
        dueDate: due || null,
      })
    );
  };

  return (
    <motion.div
      className="app-dialog-scrim"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.form
        className="app-dialog goal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        initial={{ y: 8, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <button type="button" className="app-icon-btn goal-dialog-close" onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={1.75} />
        </button>
        <h2 id="goal-title">{goal ? "Edit goal" : "New goal"}</h2>

        <label className="goal-field">
          <span>Goal</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you working towards?"
            maxLength={120}
            autoFocus
          />
        </label>
        <div className="goal-field-row">
          <label className="goal-field">
            <span>Target hours</span>
            <input
              type="number"
              inputMode="decimal"
              min={0.5}
              max={1000}
              step={0.5}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="goal-field">
            <span>Due date</span>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
        </div>

        {error && (
          <p className="goal-error" role="alert">
            Something went wrong. Please try again.
          </p>
        )}

        <div className="goal-actions">
          {goal && onDelete ? (
            confirmDelete ? (
              <span className="goal-confirm">
                Delete this goal?
                <button type="button" className="goal-link" data-tone="warn" onClick={() => run("delete", onDelete)} disabled={!!busy}>
                  {busy === "delete" ? "Deleting..." : "Delete"}
                </button>
                <button type="button" className="goal-link" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" className="goal-link" onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            )
          ) : (
            <span />
          )}
          <div className="goal-actions-right">
            {goal && onToggleDone && (
              <button type="button" className="app-ghost-btn" onClick={() => run("done", onToggleDone)} disabled={!!busy}>
                {goal.status === "completed" ? "Reopen" : "Mark complete"}
              </button>
            )}
            <button type="submit" className="app-cta" disabled={!title.trim() || !!busy}>
              {busy === "save" ? "Saving..." : goal ? "Save" : "Create goal"}
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
