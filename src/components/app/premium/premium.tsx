"use client";

import { useEffect, useState } from "react";
import { usePlan } from "../plan-context";
import PremiumView, { type Billing } from "./premium-view";

/** Premium page: plan from the app frame, billing portal and checkout from the API. */
export default function Premium() {
  const { isPremium } = usePlan();
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isPremium) return;
    fetch("/api/user/plan")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.portalUrl && setPortalUrl(d.portalUrl))
      .catch(() => {});
  }, [isPremium]);

  const upgrade = async (billing: Billing) => {
    const res = await fetch("/api/lemonsqueezy/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: billing }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error("Something went wrong. Please try again.");
    window.location.href = data.url;
  };

  return <PremiumView isPremium={isPremium} portalUrl={portalUrl} onUpgrade={upgrade} />;
}
