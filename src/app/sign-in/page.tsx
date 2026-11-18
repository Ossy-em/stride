import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SignInScreen from "@/components/auth/sign-in-screen";
import ThemeScript from "@/components/app/theme-script";
import { enabledProviders } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in", alternates: { canonical: "/sign-in" } };

// only same-site paths are allowed as a post-sign-in destination
const safePath = (p: unknown) => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") ? p : "/home");

/**
 * Already signed in on this browser? Skip the screen and go straight in
 * (to ?callbackUrl if there is one, else Home; first-timers still get
 * sent to onboarding by the app gate).
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser().catch(() => null);
  // ?error means a sign-in just failed; show the screen so the message is seen
  if (user && !params.error) redirect(safePath(params.callbackUrl));

  return (
    <>
      <ThemeScript />
      <div className="app">
        <SignInScreen methods={enabledProviders()} />
      </div>
    </>
  );
}
