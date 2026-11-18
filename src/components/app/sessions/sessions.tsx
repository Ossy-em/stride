"use client";

import { useCallback, useEffect, useState } from "react";
import type { SessionHistoryResponse } from "@/types";
import SessionsView, { type Range } from "./sessions-view";

/** Loads /api/sessions for the chosen range and renders the Sessions page. */
export default function Sessions() {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<SessionHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/sessions?range=${r}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  return (
    <SessionsView
      data={data}
      range={range}
      onRange={setRange}
      loading={loading}
      error={error}
      onRetry={() => load(range)}
    />
  );
}
