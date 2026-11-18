"use client";

/**
 * Premium: price with a monthly/yearly switch, what changes vs Free, and
 * questions. Lives in the app shell. Premium users see their plan and a
 * link to manage billing instead.
 */

import { useState } from "react";
import { Check, ChevronDown, ExternalLink, Minus } from "lucide-react";
import PageHeader from "../page-header";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import "./premium.css";

export type Billing = "monthly" | "yearly";

export const PRICES = { monthly: 6, yearly: 58 } as const;
const SAVINGS = Math.round((1 - PRICES.yearly / (PRICES.monthly * 12)) * 100);
const free = PLAN_LIMITS.free;

const ROWS: { feature: string; free: string | boolean; premium: string | boolean }[] = [
  { feature: "Sessions per day", free: String(free.maxSessionsPerDay), premium: "Unlimited" },
  { feature: "Session length", free: `${free.maxSessionDuration} min`, premium: "Up to 3 hours" },
  { feature: "Agent messages per day", free: String(free.agentMessagesPerDay), premium: "Unlimited" },
  { feature: "AI nudges", free: true, premium: true },
  { feature: "Focus Fingerprint", free: true, premium: true },
  { feature: "Goals", free: true, premium: true },
  { feature: "Pause & resume", free: true, premium: true },
  { feature: "Session history", free: "Unlimited", premium: "Unlimited" },
];

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel from your subscription management page anytime. Premium features stay active until the end of your billing period.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is never deleted. You keep your full history and insights, and go back to the free session limits.",
  },
  {
    q: "Is there a free trial?",
    a: "The free plan is your trial. Use it as long as you want. Upgrade when you're ready for more.",
  },
  { q: "What payment methods do you accept?", a: "All major credit and debit cards through our secure payment partner." },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check size={15} strokeWidth={2} className="pr-yes" aria-label="Included" />;
  if (v === false) return <Minus size={15} strokeWidth={1.75} className="pr-no" aria-label="Not included" />;
  return <>{v}</>;
}

export default function PremiumView({
  isPremium,
  portalUrl,
  onUpgrade,
}: {
  isPremium: boolean;
  portalUrl: string | null;
  onUpgrade: (billing: Billing) => Promise<void>;
}) {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const upgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpgrade(billing);
    } catch (e) {
      setError((e as Error).message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Premium" />
      <div className="app-scroll">
        <div className="app-page pr-page">
          <h1 className="pr-title">Focus without limits</h1>
          <p className="pr-sub">
            Unlimited sessions up to 3 hours, and unlimited Agent messages. Everything else is already yours on Free.
          </p>

          {isPremium ? (
            <div className="app-list pr-card">
              <span className="pr-badge">Premium</span>
              <p className="pr-thanks">You&apos;re on the Premium plan. Thank you for supporting Stride!</p>
              {portalUrl && (
                <a className="app-ghost-btn" href={portalUrl} target="_blank" rel="noopener noreferrer">
                  Manage subscription
                  <ExternalLink size={13} strokeWidth={1.75} />
                </a>
              )}
            </div>
          ) : (
            <div className="app-list pr-card">
              <div className="app-seg pr-seg" role="group" aria-label="Billing">
                <button aria-pressed={billing === "monthly"} onClick={() => setBilling("monthly")}>
                  Monthly
                </button>
                <button aria-pressed={billing === "yearly"} onClick={() => setBilling("yearly")}>
                  Yearly <span className="pr-save">Save {SAVINGS}%</span>
                </button>
              </div>
              <div className="pr-price">
                <strong>${PRICES[billing]}</strong>
                <span>/{billing === "monthly" ? "mo" : "yr"}</span>
              </div>
              <p className="pr-per">{billing === "yearly" ? `$${(PRICES.yearly / 12).toFixed(2)}/month, billed annually` : "Billed monthly"}</p>
              <button className="app-cta pr-cta" onClick={upgrade} disabled={loading}>
                {loading ? "Setting up..." : "Upgrade to Premium"}
              </button>
              {error && (
                <p className="pr-error" role="alert">
                  {error}
                </p>
              )}
              <p className="pr-fine">Cancel anytime. No questions asked.</p>
            </div>
          )}

          <section className="app-section">
            <div className="app-section-head">Free vs Premium</div>
            <div className="app-list">
              <div className="app-row pr-row pr-row-head" aria-hidden="true">
                <span className="pr-feat" />
                <span className="pr-col">Free</span>
                <span className="pr-col pr-col-premium">Premium</span>
              </div>
              {ROWS.map((r) => (
                <div className="app-row pr-row" key={r.feature}>
                  <span className="pr-feat">{r.feature}</span>
                  <span className="pr-col">
                    <Cell v={r.free} />
                  </span>
                  <span className="pr-col pr-col-premium">
                    <Cell v={r.premium} />
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="app-section">
            <div className="app-section-head">Questions</div>
            <div className="app-list">
              {FAQS.map((f, i) => (
                <div className="pr-faq" key={f.q} data-open={open === i}>
                  <button className="app-row pr-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                    <span className="app-row-main app-row-title">{f.q}</span>
                    <ChevronDown size={16} strokeWidth={1.75} className="pr-chev" />
                  </button>
                  {open === i && <p className="pr-a">{f.a}</p>}
                </div>
              ))}
            </div>
          </section>

          {isPremium && portalUrl && (
            <p className="pr-bottom">
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                Manage or cancel subscription
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
