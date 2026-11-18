"use client";

/**
 * Feedback: a floating button outside the app shell (inside it, the sidebar
 * opens the same panel via the stride:feedback event). On the app tokens,
 * so it follows light / dark like the rest of the app. Copy unchanged.
 */

import { useEffect, useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { isShellRoute } from "@/components/app/routes";
import "./floating.css";

// zero-height wrapper that only carries the app tokens; inline so it can never take up a screen
const PORTAL = { minHeight: 0, height: 0, background: "none" } as const;

type Kind = "issue" | "idea" | "general";
const KINDS: { value: Kind; label: string }[] = [
  { value: "issue", label: "Issue" },
  { value: "idea", label: "Idea" },
  { value: "general", label: "General" },
];
const PLACEHOLDER: Record<Kind, string> = {
  issue: "What happened? What did you expect?",
  idea: "What would make Stride better?",
  general: "What's on your mind?",
};

export default function FeedbackButton() {
  const reduced = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<Kind>("general");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const pathname = usePathname();

  // The app shell's sidebar opens this panel via a window event
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("stride:feedback", open);
    return () => window.removeEventListener("stride:feedback", open);
  }, []);

  // Esc closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Not on sign-in pages or during active sessions
  if (pathname?.includes("/auth") || pathname?.startsWith("/sign-in") || pathname?.includes("/session/")) {
    return null;
  }

  const close = () => {
    setIsOpen(false);
    setSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), type, page: pathname }),
      });
      if (response.ok) {
        setSent(true);
        setTimeout(() => {
          setIsOpen(false);
          setSent(false);
          setMessage("");
          setType("general");
        }, 2000);
      }
    } catch (error) {
      console.error("Feedback submit error:", error);
    } finally {
      setSending(false);
    }
  };

  // inside the app shell, feedback lives in the sidebar instead
  const showFab = !isOpen && !isShellRoute(pathname);

  return (
    <div className="app app-portal" style={PORTAL}>
      {showFab && (
        <button className="fl-fab" onClick={() => setIsOpen(true)} aria-label="Send feedback">
          <MessageSquarePlus size={18} strokeWidth={1.75} />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fl-panel"
            role="dialog"
            aria-label="Send Feedback"
            initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="fl-head">
              <span>Send Feedback</span>
              <button className="app-icon-btn fl-close" onClick={close} aria-label="Close">
                <X size={15} strokeWidth={1.75} />
              </button>
            </div>

            {sent ? (
              <div className="fl-sent" role="status">
                <p>Thanks for the feedback!</p>
                <span>This helps make Stride better.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="app-seg fl-kinds">
                  {KINDS.map((k) => (
                    <button key={k.value} type="button" aria-pressed={type === k.value} onClick={() => setType(k.value)}>
                      {k.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="fl-text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
                  }}
                  placeholder={PLACEHOLDER[type]}
                  aria-label="Feedback"
                  autoFocus
                />
                <button type="submit" className="app-cta fl-send" disabled={!message.trim() || sending}>
                  {sending ? <span className="fl-spin" aria-hidden="true" /> : "Send"}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
