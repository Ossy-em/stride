"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import SettingsView, { type AccountData, type SettingsActions } from "./settings-view";

/** Loads /api/user/account and wires saving, sign out and delete. */
export default function Settings() {
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const res = await fetch(`/api/user/account?tz=${tz}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const actions: SettingsActions = {
    save: async (patch) => {
      // show it straight away; roll back if the server says no
      const before = data;
      setData((d) => (d ? { ...d, profile: { ...d.profile, ...patch } } : d));
      const res = await fetch("/api/user/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        setData(before);
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Couldn't save. Try again.");
      }
      // names and defaults are read by the app frame, so refresh it
      router.refresh();
    },
    signOut: () => signOut({ callbackUrl: "/" }),
    deleteAccount: async (confirmEmail) => {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Couldn't delete your account. Please try again.");
      await signOut({ callbackUrl: "/" });
    },
  };

  return <SettingsView data={data} error={error} onRetry={load} actions={actions} />;
}
