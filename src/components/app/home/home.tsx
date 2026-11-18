"use client";

import { useCallback, useEffect, useState } from "react";
import type { HomeResponse } from "@/types";
import PageHeader from "../page-header";
import HomeView from "./home-view";
import HomeSkeleton from "./home-skeleton";
import EmptyState from "../empty-state";

/** Loads /api/home (in the user's timezone) and renders Home. */
export default function Home({ firstName }: { firstName?: string | null }) {
  const [data, setData] = useState<HomeResponse | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const res = await fetch(`/api/home?tz=${tz}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (data) return <HomeView data={data} firstName={firstName} />;

  return (
    <>
      <PageHeader title="Home" />
      <div className="app-scroll">
        {error ? (
          <EmptyState
            title="Couldn't load your data"
            description="Something went wrong. Please try again."
            action={
              <button className="app-ghost-btn" onClick={load}>
                Try again
              </button>
            }
          />
        ) : (
          <HomeSkeleton />
        )}
      </div>
    </>
  );
}
