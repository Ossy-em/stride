"use client";

/**
 * Plan layer for the whole app.
 *
 * Every page reads the plan and its limits from here, and every limit the
 * server enforces (a 403 with { upgrade: true }) routes to one upgrade
 * dialog. Free-tier limits can be switched on or reshaped later without
 * touching pages: change PLAN_LIMITS (lib/plan-limits) and the server checks.
 */

import { createContext, useCallback, useContext, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, MessagesSquare, Zap, type LucideIcon } from "lucide-react";
import { PLAN_LIMITS, getLimitsByPlan, type PlanLimits, type UserPlan } from "@/lib/plan-limits";

/** Free and Premium differ only in sessions per day, session length and Agent use. */
export type UpgradeReason = "session_limit" | "duration_limit" | "agent_limit";

type PlanState = {
  plan: UserPlan;
  limits: PlanLimits;
  isPremium: boolean;
  requestUpgrade: (reason: UpgradeReason) => void;
};

const PlanContext = createContext<PlanState>({
  plan: "free",
  limits: getLimitsByPlan("free"),
  isPremium: false,
  requestUpgrade: () => {},
});

export const usePlan = () => useContext(PlanContext);

// Copy carried over from the existing upgrade prompt.
const REASONS: Record<UpgradeReason, { Icon: LucideIcon; title: string; description: string }> = {
  session_limit: {
    Icon: Zap,
    title: "You've hit today's session limit",
    description: `Free accounts get ${PLAN_LIMITS.free.maxSessionsPerDay} sessions per day. Upgrade to focus as much as you need.`,
  },
  agent_limit: {
    Icon: MessagesSquare,
    title: "You've used today's Agent messages",
    description: `Free accounts get ${PLAN_LIMITS.free.agentMessagesPerDay} Agent messages a day. Upgrade to ask as much as you need.`,
  },
  duration_limit: {
    Icon: Clock,
    title: "Need a longer session?",
    description: "Free sessions max out at 30 minutes. Premium lets you go up to 3 hours.",
  },
};

const BENEFITS = [
  "Unlimited sessions",
  "Sessions up to 3 hours",
  "Unlimited Agent messages",
];

export function PlanProvider({ plan, children }: { plan: UserPlan; children: React.ReactNode }) {
  const [reason, setReason] = useState<UpgradeReason | null>(null);
  const requestUpgrade = useCallback((r: UpgradeReason) => setReason(r), []);
  const config = reason ? REASONS[reason] : null;

  return (
    <PlanContext.Provider value={{ plan, limits: getLimitsByPlan(plan), isPremium: plan === "premium", requestUpgrade }}>
      {children}
      <AnimatePresence>
        {config && (
          <motion.div
            className="app-dialog-scrim"
            onClick={() => setReason(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="app-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="upgrade-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 8, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="app-dialog-icon">
                <config.Icon size={18} strokeWidth={1.75} />
              </div>
              <h2 id="upgrade-title">{config.title}</h2>
              <p>{config.description}</p>
              <ul>
                {BENEFITS.map((b) => (
                  <li key={b}>
                    <Check size={14} strokeWidth={2} />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="app-dialog-actions">
                <button className="app-ghost-btn" onClick={() => setReason(null)}>
                  Maybe later
                </button>
                <Link href="/premium" className="app-cta" onClick={() => setReason(null)}>
                  Upgrade to Premium
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PlanContext.Provider>
  );
}
