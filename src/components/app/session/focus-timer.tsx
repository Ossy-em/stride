"use client";

/**
 * The active session, full screen (no sidebar). Same behaviour as before:
 *  - elapsed time minus paused time, from the server's start time
 *  - AI nudges: checked every minute (max 3), plus any pending ones when the
 *    tab comes back into view; first sessions get a demo nudge at minute 2
 *  - a focus check every 20 minutes, now in the same card as nudges
 *  - push notifications, with help when they're blocked
 *  - pause / resume (the server decides who can; a 403 opens the upgrade dialog)
 * The timeline under the clock marks where each nudge and check-in landed.
 * Space pauses / resumes.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, BellOff, Pause, Play, Square } from "lucide-react";
import { setupPushNotifications, type PushSetupResult } from "@/lib/push-subscription";
import CheckCard, { type FocusState, type NudgeFeedback, type Strategy } from "./check-card";
import "./session.css";

type Intervention = { id: string; message: string; strategy: Strategy };
export type TrackEvent = { at: number; kind: "nudge" | "check" }; // at = elapsed seconds

const DEMO_INTERVENTION: Intervention = {
  id: "demo-intervention",
  message:
    "This is how Stride checks in with you. We noticed you're in your first session. Respond to these nudges and we'll learn your focus patterns over time.",
  strategy: "check_in",
};

const CHECK_IN_INTERVAL = 20 * 60; // seconds
const CHECK_IN_RESPONSE: Record<FocusState, "focused" | "neutral" | "distracted"> = {
  focused: "focused",
  drifting: "neutral",
  lost: "distracted",
};

const clock = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export default function FocusTimer({
  sessionId,
  taskDescription,
  plannedDuration,
  startedAt,
  initialEvents = [],
}: {
  sessionId: string;
  taskDescription: string;
  plannedDuration: number;
  startedAt: string;
  /** Marks to show on the timeline from the start (e.g. restored after a reload). */
  initialEvents?: TrackEvent[];
}) {
  const router = useRouter();

  const [sessionStartTime] = useState(() => {
    const db = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(startedAt) ? startedAt : startedAt + "Z").getTime();
    const now = Date.now();
    return db > now || now - db > plannedDuration * 60 * 1000 * 3 ? now : db;
  });

  const [elapsed, setElapsed] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(0);
  const [checkIn, setCheckIn] = useState(false);
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [interventionCount, setInterventionCount] = useState(0);
  const [shownAt, setShownAt] = useState<number | null>(null);
  const [push, setPush] = useState<PushSetupResult>({ supported: false, subscribed: false, permission: null });
  const [pushHelp, setPushHelp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [ending, setEnding] = useState(false);
  const [ready, setReady] = useState(false);
  const [events, setEvents] = useState<TrackEvent[]>(initialEvents);
  const elapsedRef = useRef(0);

  // Timeline marks survive a reload: this browser's copy is exact; without it
  // we keep the ones the server rebuilt from saved nudges and check-ins.
  const marksKey = `stride-marks-${sessionId}`;
  const marksLoaded = useRef(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(marksKey) || "null");
      if (Array.isArray(saved) && saved.length >= initialEvents.length) setEvents(saved);
    } catch {}
    marksLoaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marksKey]);
  useEffect(() => {
    if (!marksLoaded.current) return;
    try {
      localStorage.setItem(marksKey, JSON.stringify(events));
    } catch {}
  }, [events, marksKey]);

  const demoFired = useRef(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(r);
  }, []);
  const lastInterventionCheck = useRef(0);
  const shownIds = useRef<Set<string>>(new Set());

  // first session? (demo nudge at minute 2)
  useEffect(() => {
    fetch("/api/sessions/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && d.count <= 1 && setIsFirstSession(true))
      .catch(() => {});
  }, []);

  // restore pause state
  useEffect(() => {
    fetch(`/api/sessions/status?id=${sessionId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        if (d.paused_at) {
          setIsPaused(true);
          setPausedAt(new Date(d.paused_at).getTime());
        }
        if (d.total_paused_ms) setTotalPausedMs(d.total_paused_ms);
      })
      .catch(() => {});
  }, [sessionId]);

  // push notifications
  useEffect(() => {
    setupPushNotifications().then((status) => {
      setPush(status);
      if (status.supported && !status.subscribed && status.permission === "denied") setPushHelp(true);
    });
  }, []);

  const showIfNew = useCallback(
    (iv: Intervention | null) => {
      if (!iv?.id || shownIds.current.has(iv.id) || intervention) return false;
      shownIds.current.add(iv.id);
      setEvents((ev) => [...ev, { at: elapsedRef.current, kind: "nudge" }]);
      setCheckIn(false);
      setIntervention(iv);
      setShownAt(Date.now());
      setInterventionCount((n) => n + 1);
      return true;
    },
    [intervention]
  );

  // pending nudges (e.g. sent by push while the tab was hidden)
  const checkPending = useCallback(async () => {
    if (intervention || isPaused) return;
    try {
      const res = await fetch(`/api/interventions/pending?sessionId=${sessionId}`);
      const d = await res.json();
      if (d.pending && d.intervention) showIfNew(d.intervention);
    } catch (e) {
      console.error("Error checking pending interventions:", e);
    }
  }, [sessionId, intervention, isPaused, showIfNew]);

  useEffect(() => {
    checkPending();
    const onVis = () => document.visibilityState === "visible" && checkPending();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [checkPending]);

  // clock + 20-minute focus check
  useEffect(() => {
    const tick = () => {
      if (isPaused) return;
      const secs = Math.max(0, Math.floor((Date.now() - sessionStartTime - totalPausedMs) / 1000));
      setElapsed(secs);
      elapsedRef.current = secs;
      if (secs > 0 && secs - lastCheckIn >= CHECK_IN_INTERVAL) {
        setLastCheckIn(secs);
        if (!intervention) {
          setCheckIn(true);
          setEvents((ev) => [...ev, { at: secs, kind: "check" }]);
        }
      }
    };
    tick(); // show the real time straight away, not 00:00 for a second
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [sessionStartTime, lastCheckIn, isPaused, totalPausedMs, intervention]);

  // AI nudge check, once a minute
  useEffect(() => {
    if (isPaused || elapsed === 0 || elapsed % 60 !== 0) return;
    const mins = Math.floor(elapsed / 60);
    if (interventionCount >= 3 || mins < 1 || intervention) return;
    if (mins <= lastInterventionCheck.current) return;
    lastInterventionCheck.current = mins;

    if (isFirstSession && mins === 2) {
      if (!demoFired.current) {
        demoFired.current = true;
        showIfNew(DEMO_INTERVENTION);
      }
      return;
    }

    (async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const res = await fetch("/api/interventions/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, elapsedMinutes: mins }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const d = await res.json();
        if (d.needed && d.intervention) showIfNew(d.intervention);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") console.error("Error checking intervention:", e);
      }
    })();
  }, [elapsed, sessionId, intervention, interventionCount, showIfNew, isPaused, isFirstSession]);

  const togglePause = async () => {
    setPauseLoading(true);
    try {
      const actionName = isPaused ? "resume" : "pause";
      const res = await fetch("/api/sessions/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: actionName }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return console.error("Pause/resume error:", d.error);
      if (actionName === "pause") {
        setIsPaused(true);
        setPausedAt(Date.now());
      } else {
        if (pausedAt) setTotalPausedMs((p) => p + (Date.now() - pausedAt));
        if (d.total_paused_ms !== undefined) setTotalPausedMs(d.total_paused_ms);
        setIsPaused(false);
        setPausedAt(null);
      }
    } catch (e) {
      console.error("Error toggling pause:", e);
    } finally {
      setPauseLoading(false);
    }
  };

  const toggleRef = useRef(togglePause);
  toggleRef.current = togglePause;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, button, a, [role='dialog']")) return;
      e.preventDefault();
      toggleRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sendFeedback = async (f: NudgeFeedback) => {
    if (!intervention || intervention.id === DEMO_INTERVENTION.id) return;
    try {
      await fetch("/api/interventions/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interventionId: intervention.id,
          ...f,
          responseTimeMs: shownAt ? Date.now() - shownAt : undefined,
        }),
      });
    } catch (e) {
      console.error("Error saving feedback:", e);
    }
  };

  const sendCheckIn = (state: FocusState) => {
    fetch("/api/sessions/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, response: CHECK_IN_RESPONSE[state] }),
    }).catch((e) => console.error("Error saving check-in:", e));
  };

  const retryPush = async () => {
    const status = await setupPushNotifications();
    setPush(status);
    if (status.subscribed) setPushHelp(false);
  };

  const planned = plannedDuration * 60;
  const remaining = Math.max(0, planned - elapsed);
  const over = Math.max(0, elapsed - planned);
  const pct = (secs: number) => `${Math.min(100, (secs / planned) * 100)}%`;
  const pausedNow = isPaused && pausedAt ? Date.now() - pausedAt : 0;
  const endsAt = new Date(sessionStartTime + totalPausedMs + pausedNow + planned * 1000);
  const hm = (d: Date | number) => new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const step = plannedDuration > 90 ? 30 : plannedDuration > 45 ? 15 : 5;
  const ticks = Array.from({ length: Math.floor((plannedDuration - 1) / step) }, (_, i) => (i + 1) * step * 60);
  const NotifIcon = push.subscribed ? Bell : BellOff;

  return (
    <div className="focus-page" data-paused={isPaused} data-ready={ready}>
      <header className="focus-bar">
        <Link href="/home" className="app-icon-btn" aria-label="Back to Home" title="Back to Home">
          <ArrowLeft size={17} strokeWidth={1.75} />
        </Link>
        <div className="focus-status">
          <span className="focus-dot" />
          {isPaused ? "Session paused" : "Focus session active"}
        </div>
        <div className="focus-notif" data-on={push.subscribed}>
          <NotifIcon size={14} strokeWidth={1.75} />
          <span>
            {push.subscribed ? "Notifications on" : push.permission === "denied" ? "Notifications blocked" : "Notifications off"}
          </span>
        </div>
      </header>

      {pushHelp && (
        <div className="focus-alert" role="alert">
          <p>
            <strong>Notifications are blocked.</strong> Enable them in browser settings so Stride can reach you even
            when you switch tabs.
          </p>
          <div>
            <button className="app-ghost-btn" onClick={retryPush}>
              Try again
            </button>
            <button className="app-ghost-btn" onClick={() => setPushHelp(false)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="focus-stage">
        <div className="focus-col">
          <p className="focus-kicker">Currently focused on</p>
          <h1 className="focus-task">{taskDescription}</h1>

          <div className="focus-time" aria-live="off">
            {clock(elapsed)}
          </div>
          <p className="focus-meta">
            {isPaused ? "Paused" : over ? `${clock(over)} over` : `${clock(remaining)} remaining`}
            <span className="sep">·</span>
            Ends {hm(endsAt)}
          </p>

          <div
            className="focus-track"
            role="progressbar"
            aria-label="Session progress"
            aria-valuemin={0}
            aria-valuemax={planned}
            aria-valuenow={Math.min(elapsed, planned)}
          >
            <div className="track-line">
              <span className="track-fill" style={{ width: pct(elapsed) }} />
            </div>
            {ticks.map((t) => (
              <span key={t} className="track-tick" style={{ left: pct(t) }} />
            ))}
            {events.map((e, i) => (
              <span
                key={i}
                className="track-mark"
                data-kind={e.kind}
                style={{ left: pct(e.at) }}
                title={`${e.kind === "nudge" ? "Nudge" : "Check-in"} at ${clock(e.at)}`}
              />
            ))}
            <span className="track-head" style={{ left: pct(elapsed) }} />
          </div>
          <div className="focus-track-labels">
            <span>Started {hm(sessionStartTime)}</span>
            {events.length > 0 && (
              <span className="focus-legend">
                <i data-kind="nudge" /> Nudge <i data-kind="check" /> Check-in
              </span>
            )}
            <span>{plannedDuration} min</span>
          </div>

          <div className="focus-actions">
            <button className="app-ghost-btn" onClick={togglePause} disabled={pauseLoading}>
              {isPaused ? <Play size={14} strokeWidth={2} /> : <Pause size={14} strokeWidth={2} />}
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              className="app-cta"
              disabled={ending}
              onClick={() => {
                setEnding(true);
                router.push(`/session/end?id=${sessionId}`);
              }}
            >
              <Square size={12} strokeWidth={2.5} />
              {ending ? "Ending..." : "End session"}
            </button>
          </div>
          <p className="focus-hint">
            <kbd>Space</kbd> to {isPaused ? "resume" : "pause"}
          </p>
        </div>
      </main>

      <AnimatePresence>
        {intervention && (
          <CheckCard
            key={intervention.id}
            mode="nudge"
            intervention={intervention}
            onFeedback={sendFeedback}
            onClose={() => setIntervention(null)}
          />
        )}
        {!intervention && checkIn && (
          <CheckCard key="checkin" mode="checkin" onCheckIn={sendCheckIn} onClose={() => setCheckIn(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
