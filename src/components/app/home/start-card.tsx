"use client";

/**
 * Start a focus session straight from Home.
 * Same request as the old /session/start form; limits the server
 * enforces (403 + upgrade) open the shared upgrade dialog.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Flag, Layers } from "lucide-react";
import ChipMenu from "../chip-menu";
import { usePlan } from "../plan-context";
import { useUserPrefs } from "../user-context";
import { FREE_LIMITS_UI } from "@/lib/plan-limits";

type TaskType = "writing" | "reading" | "coding";

const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: "writing", label: "Writing" },
  { value: "reading", label: "Learning" },
  { value: "coding", label: "Development" },
];
const PRESETS = [15, 25, 45, 60];

const hourLabel = (h: number) => (h === 0 ? "12am" : h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`);
const clamp = (n: number) => Math.min(180, Math.max(3, Math.round(n)));
const short = (s: string) => (s.length > 22 ? `${s.slice(0, 21).trimEnd()}…` : s);

/** Active goals for the picker; hidden until the user has at least one. */
function useActiveGoals() {
  const [goals, setGoals] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    let live = true;
    fetch("/api/goals?lite=1")
      .then((r) => (r.ok ? r.json() : { goals: [] }))
      .then((d) => live && setGoals(d.goals || []))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return goals;
}

export default function StartCard({
  suggestedDuration = 25,
  peakHours = null,
  sessionsToday = 0,
  autoFocus = false,
  initialGoalId,
}: {
  suggestedDuration?: number;
  peakHours?: { start: number; end: number; improvement?: number } | null;
  sessionsToday?: number;
  autoFocus?: boolean;
  /** pre-pick this goal (e.g. "Start session" on a goal page) */
  initialGoalId?: string;
}) {
  const router = useRouter();
  const { isPremium, limits, requestUpgrade } = usePlan();
  const [task, setTask] = useState("");
  const prefs = useUserPrefs();
  // a default set in Settings wins over the suggestion
  const [taskType, setTaskType] = useState<TaskType>(prefs.defaultTaskType ?? "coding");
  const [duration, setDuration] = useState(clamp(prefs.defaultDuration ?? (suggestedDuration || 25)));
  const [custom, setCustom] = useState("");
  const goals = useActiveGoals();
  const [goalId, setGoalId] = useState(initialGoalId ?? "");
  const goal = goals.find((g) => g.id === goalId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hour = new Date().getHours();
  const inPeak = !!peakHours && hour >= peakHours.start && hour < peakHours.end;

  const durationOptions = Array.from(new Set([...PRESETS, clamp(suggestedDuration || 25)]))
    .sort((a, b) => a - b)
    .map((m) => ({ value: m, label: `${m} min`, hint: m === suggestedDuration && m !== 25 ? "Suggested" : undefined }));
  if (!durationOptions.some((o) => o.value === duration)) {
    durationOptions.push({ value: duration, label: `${duration} min`, hint: undefined });
  }

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskDescription: task.trim(),
          taskType,
          plannedDuration: duration,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          goalId: goal ? goal.id : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403 && data.upgrade) {
        requestUpgrade(data.sessionsToday !== undefined ? "session_limit" : "duration_limit");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error();
      router.push(`/session/active?id=${data.sessionId}`);
    } catch {
      setError("Failed to start session. Please try again.");
      setLoading(false);
    }
  };

  const showCounter = FREE_LIMITS_UI && !isPremium && limits.maxSessionsPerDay > 0;
  const left = limits.maxSessionsPerDay - sessionsToday;

  return (
    <div className="home-start">
      <form className="app-composer" onSubmit={start}>
        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What will you work on?"
          aria-label="What will you work on?"
          maxLength={200}
          autoFocus={autoFocus}
        />
        <div className="app-composer-row">
          <div className="home-chips">
            <ChipMenu
              icon={Layers}
              label={TASK_TYPES.find((t) => t.value === taskType)!.label}
              ariaLabel="Task type"
              options={TASK_TYPES}
              value={taskType}
              onChange={setTaskType}
            />
            <ChipMenu
              icon={Clock}
              label={`${duration} min`}
              ariaLabel="Focus duration"
              options={durationOptions}
              value={duration}
              onChange={setDuration}
              footer={(close) => (
                <label className="home-custom">
                  Custom
                  <input
                    type="number"
                    min={3}
                    max={180}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const n = parseInt(custom);
                        if (!isNaN(n)) setDuration(clamp(n));
                        close();
                      }
                    }}
                  />
                  min
                </label>
              )}
            />
            {goals.length > 0 && (
              <ChipMenu
                icon={Flag}
                label={goal ? short(goal.title) : "No goal"}
                ariaLabel="Goal"
                options={[{ value: "", label: "No goal" }, ...goals.map((g) => ({ value: g.id, label: g.title }))]}
                value={goalId}
                onChange={setGoalId}
              />
            )}
          </div>
          <button type="submit" className="app-cta" disabled={!task.trim() || loading}>
            {loading ? "Starting..." : "Start session"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="home-note" data-tone="warn" role="alert">
          <span className="dot" />
          {error}
        </p>
      ) : inPeak ? (
        <p className="home-note">
          <span className="dot" />
          You&apos;re in your peak focus window
        </p>
      ) : peakHours ? (
        <p className="home-note">
          <span className="dot" style={{ background: "var(--app-quiet)" }} />
          Your peak hours are {hourLabel(peakHours.start)}-{hourLabel(peakHours.end)}. Sessions then are{" "}
          {typeof peakHours.improvement === "number" ? `${peakHours.improvement}%` : "often"} more effective.
        </p>
      ) : null}

      {showCounter && (
        <p className="home-note" data-tone={left <= 1 ? "warn" : undefined}>
          <span className="dot" />
          Sessions today: {sessionsToday}/{limits.maxSessionsPerDay} used
        </p>
      )}
    </div>
  );
}
