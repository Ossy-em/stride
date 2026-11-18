"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemePref = "system" | "light" | "dark";
const KEY = "stride-theme";

/** Theme preference for the app shell. Saved per browser for now; moves to the account with Settings. */
export function useAppTheme() {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    try {
      const t = localStorage.getItem(KEY);
      if (t === "light" || t === "dark") setPref(t);
    } catch {}
  }, []);

  const set = useCallback((p: ThemePref) => {
    setPref(p);
    try {
      if (p === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, p);
    } catch {}
    const el = document.documentElement;
    if (p === "system") el.removeAttribute("data-app-theme");
    else el.setAttribute("data-app-theme", p);
  }, []);

  return [pref, set] as const;
}
