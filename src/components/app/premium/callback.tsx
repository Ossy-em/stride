"use client";

/**
 * After Lemon Squeezy checkout. Confirms the upgrade, retrying for a bit
 * while the payment webhook catches up, then refreshes the plan.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "../page-header";
import EmptyState from "../empty-state";

export type CallbackStatus = "verifying" | "success" | "pending" | "failed";

export function CallbackView({ status }: { status: CallbackStatus }) {
  return (
    <>
      <PageHeader title="Premium" />
      <div className="app-scroll">
        {status === "verifying" && (
          <EmptyState title="Verifying payment..." description="Hold on, we're confirming your upgrade." />
        )}
        {status === "success" && (
          <EmptyState
            title="Welcome to Premium!"
            description="You now have unlimited sessions up to 3 hours, and unlimited Agent messages."
            action={
              <Link href="/home" className="app-cta">
                Go to Home
              </Link>
            }
          />
        )}
        {status === "pending" && (
          <EmptyState
            title="Payment received!"
            description="Your upgrade is being processed. This usually takes a few seconds. You can head to Home. It'll activate automatically."
            action={
              <Link href="/home" className="app-ghost-btn">
                Go to Home
              </Link>
            }
          />
        )}
        {status === "failed" && (
          <EmptyState
            title="Something went wrong"
            description="We couldn't verify your payment. If you were charged, please contact us and we'll sort it out."
            action={
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/premium" className="app-cta">
                  Try again
                </Link>
                <a href="mailto:emosinachi@gmail.com" className="app-ghost-btn">
                  Contact support
                </a>
              </div>
            }
          />
        )}
      </div>
    </>
  );
}

export default function PaymentCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<CallbackStatus>("verifying");

  useEffect(() => {
    let live = true;
    let tries = 0;
    const check = async () => {
      try {
        const res = await fetch("/api/lemonsqueezy/verify");
        const data = await res.json();
        if (!live) return;
        if (data.verified) {
          setStatus("success");
          router.refresh(); // the sidebar and limits pick up the new plan
        } else if (data.pending && tries < 6) {
          setStatus("pending");
          tries++;
          setTimeout(check, 4000);
        } else setStatus(data.pending ? "pending" : "failed");
      } catch {
        if (live) setStatus("failed");
      }
    };
    check();
    return () => {
      live = false;
    };
  }, [router]);

  return <CallbackView status={status} />;
}
