import { PlanProvider } from "./plan-context";
import ThemeScript from "./theme-script";
import type { UserPlan } from "@/lib/plan-limits";

/**
 * Frame for the full-screen session views (timer, session complete):
 * no sidebar, but the same theme tokens and the upgrade dialog.
 * Pages do their own sign-in and ownership checks before rendering this.
 */
export default function FocusFrame({ plan, children }: { plan: UserPlan; children: React.ReactNode }) {
  return (
    <>
      <ThemeScript />
      <div className="app">
        <PlanProvider plan={plan}>{children}</PlanProvider>
      </div>
    </>
  );
}
