import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasOnboarded } from "@/lib/onboarding";
import ThemeScript from "@/components/app/theme-script";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };

/**
 * First-time intro. Signed-out -> sign in. Already onboarded -> Home.
 * Checked on the server, so nobody sees a flash of the wrong screen.
 * Uses the app theme (light / dark / system) like the rest of the app.
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (await hasOnboarded(user.id)) redirect("/home");

  return (
    <>
      <ThemeScript />
      <div className="app">
        <OnboardingFlow userName={user.name ?? undefined} />
      </div>
    </>
  );
}
