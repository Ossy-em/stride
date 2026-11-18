"use client";

/** Landing page for email sign-in links: checks the link and signs in. */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { signIn } from "next-auth/react";
import ThemeScript from "@/components/app/theme-script";
import "@/components/auth/auth.css";

const safePath = (p: string | null) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/home");

export default function VerifyPage() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const email = q.get("email");
    const token = q.get("token");
    if (!email || !token) return setFailed(true);
    signIn("email-link", { email, token, redirect: false }).then((res) => {
      if (res?.ok && !res.error) window.location.replace(safePath(q.get("callbackUrl")));
      else setFailed(true);
    });
  }, []);

  return (
    <>
      <ThemeScript />
      <div className="app">
        <main className="auth">
          <div className="auth-col auth-verify">
            <Link href="/" className="auth-mark" aria-label="Stride home">
              <Logo size={26} />
            </Link>
            {failed ? (
              <>
                <h1 className="auth-title">That link didn&apos;t work</h1>
                <p>It may have expired or already been used.</p>
                <Link href="/sign-in" className="auth-btn auth-btn--primary">
                  Get a new link
                </Link>
              </>
            ) : (
              <p role="status">Signing you in…</p>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
