"use client";

/**
 * Sign-in screen, served at /sign-in, on Linear's structure: mark, one
 * line, stacked pill buttons, legal. Email opens its own step in place.
 * It's also sign-up: the first sign-in with any method creates the account
 * (see api/auth route), then the app gate sends first-timers to /onboarding.
 * Google, Apple, GitHub and an email link all land in the same account when
 * the email matches. Uses the app theme (light / dark / system).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./auth.css";

export type SignInMethods = { google: boolean; apple: boolean; github: boolean; email: boolean };

// only same-site paths are allowed as a post-sign-in destination
const safePath = (p: string | null) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/home");

const Spinner = () => <span className="auth-spin" aria-hidden="true" />;

export default function SignInScreen({ methods }: { methods: SignInMethods }) {
  const reduced = useReducedMotion();
  const [view, setView] = useState<"methods" | "email" | "sent">("methods");
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/home");
  const input = useRef<HTMLInputElement>(null);

  // read ?callbackUrl and ?error without a Suspense boundary
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setCallbackUrl(safePath(q.get("callbackUrl")));
    setFailed(q.has("error"));
  }, []);

  useEffect(() => {
    if (view === "email") input.current?.focus();
  }, [view]);

  const go = (provider: "google" | "apple" | "github") => {
    setLoading(provider);
    signIn(provider, { callbackUrl });
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading("email");
    setEmailError(null);
    try {
      const res = await fetch("/api/auth-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't send the email. Try again.");
      setView("sent");
    } catch (err) {
      setEmailError((err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const providers = (
    [
      ["google", "Continue with Google", methods.google],
      ["apple", "Continue with Apple", methods.apple],
      ["github", "Continue with GitHub", methods.github],
    ] as const
  ).filter(([, , on]) => on);

  const motionProps = {
    initial: reduced ? false : { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: reduced ? undefined : { opacity: 0, y: -4 },
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <main className="auth">
      <div className="auth-col">
        <Link href="/" className="auth-mark" aria-label="Stride home">
          <Logo size={26} />
        </Link>

        <AnimatePresence mode="wait" initial={false}>
          {view === "methods" && (
            <motion.div key="methods" className="auth-step" {...motionProps}>
              <h1 className="auth-title">Start before you drift.</h1>
              <div className="auth-buttons">
                {providers.map(([id, label], i) => (
                  <button
                    key={id}
                    className={i === 0 ? "auth-btn auth-btn--primary" : "auth-btn"}
                    disabled={!!loading}
                    onClick={() => go(id)}
                  >
                    {loading === id ? <Spinner /> : label}
                  </button>
                ))}
                {methods.email && (
                  <button
                    className={providers.length ? "auth-btn" : "auth-btn auth-btn--primary"}
                    disabled={!!loading}
                    onClick={() => setView("email")}
                  >
                    Continue with email
                  </button>
                )}
              </div>
              {failed && !loading && (
                <p className="auth-error" role="alert">
                  Sign-in didn&apos;t go through. Try again.
                </p>
              )}
            </motion.div>
          )}

          {view === "email" && (
            <motion.div key="email" className="auth-step" {...motionProps}>
              <h1 className="auth-title">Start before you drift.</h1>
              <form className="auth-buttons" onSubmit={sendLink}>
                <input
                  ref={input}
                  className="auth-input"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="auth-btn auth-btn--primary" disabled={!!loading || !email.trim()}>
                  {loading === "email" ? <Spinner /> : "Continue with email"}
                </button>
              </form>
              {emailError && (
                <p className="auth-error" role="alert">
                  {emailError}
                </p>
              )}
              <button className="auth-link" onClick={() => setView("methods")} disabled={!!loading}>
                Back
              </button>
            </motion.div>
          )}

          {view === "sent" && (
            <motion.div key="sent" className="auth-step" role="status" {...motionProps}>
              <p className="auth-sent">
                We sent a sign-in link to <strong>{email.trim()}</strong>. It works once and expires in 15 minutes.
              </p>
              <button className="auth-link" onClick={() => setView("email")}>
                Use a different email
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="auth-legal">
          By signing in, you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
