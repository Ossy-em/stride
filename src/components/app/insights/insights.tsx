"use client";

import { useCallback, useEffect, useState } from "react";
import type { FocusFingerprintData } from "@/types";
import PageHeader from "../page-header";
import EmptyState from "../empty-state";
import InsightsView, { InsightsSkeleton, type InsightsData } from "./insights-view";

type Raw =
  | FocusFingerprintData
  | { insufficient_data: true; sessions_completed: number; sessions_needed: number };

export function toInsights(r: Raw): InsightsData {
  if ("insufficient_data" in r) return { kind: "forming", completed: r.sessions_completed, needed: r.sessions_needed };
  return { kind: "full", data: r };
}

/** Loads /api/insights (hours and days in the user's timezone) and renders Insights. */
export default function Insights() {
  const [state, setState] = useState<InsightsData | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const res = await fetch(`/api/insights?tz=${tz}`);
      if (!res.ok) throw new Error();
      setState(toInsights(await res.json()));
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader title="Insights" />
      <div className="app-scroll">
        {error ? (
          <EmptyState
            title="Couldn't load your insights"
            description="Something went wrong. Please try again."
            action={
              <button className="app-ghost-btn" onClick={load}>
                Try again
              </button>
            }
          />
        ) : state ? (
          <InsightsView state={state} />
        ) : (
          <InsightsSkeleton />
        )}
      </div>
    </>
  );
}
