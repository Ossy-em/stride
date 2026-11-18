"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GoalDetail as Detail } from "@/types";
import GoalPage, { type GoalPageActions } from "./goal-page";

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error();
  return res;
}

/** Loads /api/goals/[id] and wires the goal's tick box, edit, delete and steps. */
export default function GoalDetail({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch(`/api/goals/${id}`);
      if (res.status === 404) return setNotFound(true);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // change the screen first, then save and re-sync
  const optimistic = (fn: (d: Detail) => Detail) => setData((d) => (d ? fn(d) : d));
  const withSteps = (d: Detail, steps: Detail["steps"]): Detail => ({
    ...d,
    steps,
    goal: { ...d.goal, stepsTotal: steps.length, stepsDone: steps.filter((s) => s.done).length },
  });

  const actions: GoalPageActions = {
    update: async (patch) => {
      if (patch.status) {
        const completedAt = patch.status === "completed" ? new Date().toISOString() : null;
        optimistic((d) => ({ ...d, goal: { ...d.goal, status: patch.status!, completedAt } }));
      }
      try {
        await send(`/api/goals/${id}`, "PATCH", patch);
      } finally {
        await load();
      }
    },
    remove: async () => {
      await send(`/api/goals/${id}`, "DELETE");
      router.push("/goals");
    },
    addStep: async (title) => {
      await send(`/api/goals/${id}/steps`, "POST", { title });
      await load();
    },
    toggleStep: async (stepId, done) => {
      optimistic((d) => withSteps(d, d.steps.map((s) => (s.id === stepId ? { ...s, done } : s))));
      try {
        await send(`/api/goals/${id}/steps/${stepId}`, "PATCH", { done });
      } finally {
        load();
      }
    },
    deleteStep: async (stepId) => {
      optimistic((d) => withSteps(d, d.steps.filter((s) => s.id !== stepId)));
      try {
        await send(`/api/goals/${id}/steps/${stepId}`, "DELETE");
      } finally {
        load();
      }
    },
  };

  return <GoalPage data={data} error={error} notFound={notFound} onRetry={load} actions={actions} />;
}
