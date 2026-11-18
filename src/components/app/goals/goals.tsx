"use client";

import { useCallback, useEffect, useState } from "react";
import type { GoalsResponse } from "@/types";
import GoalsView, { type GoalActions } from "./goals-view";

const tz = () => encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error();
}

/** Loads /api/goals and wires create / edit / delete / weekly target. */
export default function Goals() {
  const [data, setData] = useState<GoalsResponse | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch(`/api/goals?tz=${tz()}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const actions: GoalActions = {
    create: async (input) => {
      await send("/api/goals", "POST", input);
      await load();
    },
    update: async (id, patch) => {
      // ticking a goal should feel instant
      if (patch.status) {
        const completedAt = patch.status === "completed" ? new Date().toISOString() : null;
        setData((d) =>
          d ? { ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, status: patch.status!, completedAt } : g)) } : d
        );
      }
      try {
        await send(`/api/goals/${id}`, "PATCH", patch);
      } finally {
        await load();
      }
    },
    setWeekly: async (targetMinutes) => {
      // show it straight away, then confirm with the server
      setData((d) => (d ? { ...d, week: { ...d.week, targetMinutes } } : d));
      try {
        await send("/api/goals/weekly", "PUT", { targetMinutes });
      } finally {
        load();
      }
    },
  };

  return <GoalsView data={data} error={error} onRetry={load} actions={actions} />;
}
