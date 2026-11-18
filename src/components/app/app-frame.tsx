import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasOnboarded } from "@/lib/onboarding";
import { getUserPlan } from "@/lib/plans";
import { getProfile } from "@/lib/account";
import { UserProvider } from "./user-context";
import AppShell from "./app-shell";
import ThemeScript from "./theme-script";

/**
 * Server wrapper for every page inside the app shell:
 * signed-out -> sign in, first-timers -> onboarding, then the shell.
 */
export default async function AppFrame({ path, children }: { path: string; children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(path)}`);
  if (!(await hasOnboarded(user.id))) redirect("/onboarding");

  let plan: "free" | "premium" = "free";
  try {
    plan = await getUserPlan(user.id);
  } catch {}
  // the users row is the source of truth (a name changed in Settings shows straight away)
  const profile = await getProfile(user.id).catch(() => null);

  return (
    <>
      <ThemeScript />
      <UserProvider
        prefs={{ defaultDuration: profile?.defaultDuration ?? null, defaultTaskType: profile?.defaultTaskType ?? null }}
      >
        <AppShell
          user={{ name: profile?.name ?? user.name, email: profile?.email ?? user.email, image: profile?.image ?? user.image }}
          plan={plan}
        >
          {children}
        </AppShell>
      </UserProvider>
    </>
  );
}
