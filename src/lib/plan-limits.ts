/**
 * Plan limits, pure data. Safe to import from client components
 * (plans.ts holds the server checks and re-exports these).
 *
 * Free and Premium differ in three things only: how many sessions a day,
 * how long a session can run, and how much the Agent can be used.
 * Everything else (Insights, pause, history) is the same on both.
 */

export type UserPlan = "free" | "premium";

/**
 * Free-tier limits in the UI (session counters). Off while the core
 * experience is built; flip to true to show them. Server enforcement
 * lives in lib/plans.ts and is independent of this.
 */
export const FREE_LIMITS_UI = false;

export interface PlanLimits {
  maxSessionsPerDay: number; // -1 for unlimited
  maxSessionDuration: number; // minutes
  agentMessagesPerDay: number; // Agent uses per day, -1 for unlimited. Enforced once the Agent ships.
  interventionModel: "claude-sonnet-5"; // same on both plans
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxSessionsPerDay: 2,
    maxSessionDuration: 30,
    agentMessagesPerDay: 5,
    interventionModel: "claude-sonnet-5",
  },
  premium: {
    maxSessionsPerDay: -1,
    maxSessionDuration: 180,
    agentMessagesPerDay: -1,
    interventionModel: "claude-sonnet-5",
  },
};

export function getLimitsByPlan(plan: UserPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}
