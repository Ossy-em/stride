"use client";

/**
 * One goal: tick it off, its steps (a small checklist), and every saved
 * session that counted towards it.
 */

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Plus, X } from "lucide-react";
import type { GoalDetail } from "@/types";
import PageHeader from "../page-header";
import EmptyState from "../empty-state";
import { useStartSession } from "../start-dialog";
import GoalDialog, { type GoalInput } from "./goal-dialog";
import { hours, minutes, shortDate, todayYmd } from "./format";
import "./goals.css";

export type GoalPageActions = {
  update: (patch: Partial<GoalInput> & { status?: "active" | "completed" }) => Promise<void>;
  remove: () => Promise<void>;
  addStep: (title: string) => Promise<void>;
  toggleStep: (id: string, done: boolean) => Promise<void>;
  deleteStep: (id: string) => Promise<void>;
};

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function Crumbs({ title }: { title?: string }) {
  return (
    <nav className="goal-crumbs" aria-label="Breadcrumb">
      <Link href="/goals">Goals</Link>
      {title && (
        <>
          <ChevronRight size={14} strokeWidth={1.75} />
          <span>{title}</span>
        </>
      )}
    </nav>
  );
}

function Steps({ data, actions }: { data: GoalDetail; actions: GoalPageActions }) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const { steps } = data;

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t || adding) return;
    setAdding(true);
    try {
      await actions.addStep(t);
      setDraft("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="app-section">
      <div className="app-section-head">
        <span>Steps</span>
        {steps.length > 0 && (
          <span>
            {steps.filter((s) => s.done).length} of {steps.length}
          </span>
        )}
      </div>
      <div className="app-list">
        {steps.map((s) => (
          <div className="app-row step-row" key={s.id} data-done={s.done}>
            <button
              className="goal-check"
              role="checkbox"
              aria-checked={s.done}
              aria-label={s.done ? `Mark "${s.title}" as not done` : `Mark "${s.title}" as done`}
              onClick={() => actions.toggleStep(s.id, !s.done)}
            >
              <Check size={12} strokeWidth={2.5} />
            </button>
            <span className="app-row-main step-title">{s.title}</span>
            <button className="app-icon-btn step-delete" aria-label={`Delete "${s.title}"`} onClick={() => actions.deleteStep(s.id)}>
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
        ))}
        <form className="app-row step-add" onSubmit={add}>
          <Plus size={16} strokeWidth={1.75} />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a step"
            aria-label="Add a step"
            maxLength={200}
            disabled={adding}
          />
        </form>
      </div>
    </section>
  );
}

export function GoalPageSkeleton() {
  const Bar = ({ w, h = 12, r = 6, style }: { w: number | string; h?: number; r?: number; style?: React.CSSProperties }) => (
    <span className="app-skel" style={{ display: "block", width: w, height: h, borderRadius: r, ...style }} />
  );
  return (
    <div className="app-page goal-page" aria-busy="true" aria-label="Loading">
      <div className="goal-head">
        <Bar w={22} h={22} r={999} />
        <div style={{ flex: 1 }}>
          <Bar w="60%" h={22} />
          <Bar w="40%" h={12} style={{ marginTop: 10 }} />
        </div>
      </div>
      {[3, 2].map((n, g) => (
        <section className="app-section" key={g}>
          <Bar w={56} h={11} style={{ margin: "0 2px 14px" }} />
          <div className="app-list">
            {Array.from({ length: n }, (_, i) => (
              <div className="app-row" key={i}>
                <Bar w={16} h={16} r={999} />
                <Bar w={`${50 - i * 10}%`} h={13} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function GoalPage({
  data,
  error,
  notFound,
  onRetry,
  actions,
}: {
  data: GoalDetail | null;
  error?: boolean;
  notFound?: boolean;
  onRetry?: () => void;
  actions: GoalPageActions;
}) {
  const [editing, setEditing] = useState(false);
  const { openStart } = useStartSession();
  const g = data?.goal;
  const done = g?.status === "completed";
  const pct = g?.targetMinutes ? Math.min(g.minutes / g.targetMinutes, 1) : null;
  const overdue = !!g && !done && !!g.dueDate && g.dueDate < todayYmd();

  const meta = g
    ? [
        done && g.completedAt ? `Done ${shortDate(g.completedAt.slice(0, 10))}` : g.dueDate ? `Due ${shortDate(g.dueDate)}` : `Added ${shortDate(g.createdAt.slice(0, 10))}`,
        g.targetMinutes ? `${minutes(g.minutes)} of ${hours(g.targetMinutes)}` : `${minutes(g.minutes)} focused`,
        `${g.sessions} session${g.sessions === 1 ? "" : "s"}`,
      ]
    : [];

  return (
    <>
      <PageHeader
        actions={
          g ? (
            <button className="app-ghost-btn goals-edit" onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : null
        }
      >
        <Crumbs title={g?.title} />
      </PageHeader>
      <div className="app-scroll">
        {notFound ? (
          <EmptyState
            title="Goal not found"
            description="It may have been deleted."
            action={
              <Link className="app-ghost-btn" href="/goals">
                Back to Goals
              </Link>
            }
          />
        ) : error ? (
          <EmptyState
            title="Couldn't load this goal"
            description="Something went wrong. Please try again."
            action={
              <button className="app-ghost-btn" onClick={onRetry}>
                Try again
              </button>
            }
          />
        ) : !data || !g ? (
          <GoalPageSkeleton />
        ) : (
          <div className="app-page goal-page">
            <div className="goal-head" data-done={done}>
              <button
                className="goal-check goal-check-lg"
                role="checkbox"
                aria-checked={done}
                aria-label={done ? "Mark goal as not done" : "Mark goal as done"}
                onClick={() => actions.update({ status: done ? "active" : "completed" })}
              >
                <Check size={14} strokeWidth={2.5} />
              </button>
              <div className="goal-head-main">
                <h2>{g.title}</h2>
                <p>
                  {meta.map((m, i) => (
                    <span key={i} data-tone={i === 0 && overdue ? "warn" : undefined}>
                      {m}
                    </span>
                  ))}
                </p>
                {pct !== null && (
                  <div className="goal-head-progress">
                    <div className="app-progress goals-progress" aria-hidden="true">
                      <span style={{ width: `${pct * 100}%` }} />
                    </div>
                    <span>{Math.round(pct * 100)}%</span>
                  </div>
                )}
              </div>
            </div>

            <Steps data={data} actions={actions} />

            <section className="app-section">
              <div className="app-section-head">
                <span>Sessions</span>
                {data.sessions.length > 0 && <span>{minutes(g.minutes)}</span>}
              </div>
              {data.sessions.length ? (
                <div className="app-list">
                  {data.sessions.map((s) => (
                    <div className="app-row" key={s.id}>
                      <div className="app-row-main">
                        <span className="app-row-title goal-title">{s.task}</span>
                        <span className="app-row-sub">
                          {shortDate(s.startedAt.slice(0, 10))} · {time(s.startedAt)}
                        </span>
                      </div>
                      <span className="sess-meta">
                        <span>{minutes(s.minutes)}</span>
                        {s.focusQuality !== null && (
                          <span className="sess-score" data-low={s.focusQuality < 5}>
                            {s.focusQuality}/10
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="app-list goals-none">
                  <p>No sessions yet. Start one and pick this goal so the time counts towards it.</p>
                  <button className="app-cta" onClick={() => openStart({ goalId: g.id })} disabled={done}>
                    Start session
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && g && (
          <GoalDialog
            goal={g}
            onClose={() => setEditing(false)}
            onSave={(input) => actions.update(input)}
            onDelete={actions.remove}
            onToggleDone={() => actions.update({ status: done ? "active" : "completed" })}
          />
        )}
      </AnimatePresence>
    </>
  );
}
