"use client";

/**
 * Add-to-home-screen sheet for iOS Safari (push only works from the
 * installed app there). On the app tokens; copy unchanged.
 */

import { useState, useEffect } from "react";
import { Share, X, Plus, Check, ArrowDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./floating.css";

// zero-height wrapper that only carries the app tokens; inline so it can never take up a screen
const PORTAL = { minHeight: 0, height: 0, background: "none" } as const;

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator && Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function isSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
}

const DISMISS_KEY = "stride-ios-prompt-dismissed";

export default function IOSInstallPrompt({ preview = false }: { preview?: boolean }) {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(preview);

  useEffect(() => {
    if (preview) return;
    // Only show on iOS Safari when not already installed
    if (!isIOS() || !isSafari() || isInStandaloneMode()) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {}
    // Small delay so it doesn't flash on load
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, [preview]);

  const handleDismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "true");
    } catch {}
  };

  const steps = [
    {
      Icon: Share,
      text: (
        <>
          Tap the <strong>Share</strong> button in Safari
        </>
      ),
    },
    {
      Icon: Plus,
      text: (
        <>
          Scroll down and tap <strong>Add to Home Screen</strong>
        </>
      ),
    },
    { Icon: Check, text: <>Open Stride from your home screen and notifications will work</> },
  ];

  return (
    <div className="app app-portal" style={PORTAL}>
      <AnimatePresence>
        {show && (
          <div className="fl-sheet-wrap">
            <motion.div
              className="fl-scrim"
              onClick={handleDismiss}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fl-sheet"
              role="dialog"
              aria-label="Install Stride"
              initial={reduced ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduced ? undefined : { y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className="app-icon-btn fl-close fl-sheet-close" onClick={handleDismiss} aria-label="Close">
                <X size={15} strokeWidth={1.75} />
              </button>
              <h3>Install Stride</h3>
              <p className="fl-sheet-lead">Add to your home screen to get focus notifications on mobile.</p>
              <ol className="fl-steps">
                {steps.map(({ Icon, text }, i) => (
                  <li key={i}>
                    <span className="fl-step-icon">
                      <Icon size={15} strokeWidth={1.75} />
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
              <ArrowDown className="fl-sheet-arrow" size={18} strokeWidth={1.75} aria-hidden="true" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
