"use client";

/**
 * "Start session" as a modal, available on every page in the app shell:
 * const { openStart } = useStartSession(). Same form and request as Home.
 * openStart({ goalId }) opens it with that goal already picked.
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import StartCard from "./home/start-card";

type StartOptions = { goalId?: string };
const StartContext = createContext<{ openStart: (opts?: StartOptions) => void }>({ openStart: () => {} });
export const useStartSession = () => useContext(StartContext);

export function StartSessionProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<StartOptions>({});
  const openStart = useCallback((o?: StartOptions) => {
    setOpts(o ?? {});
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // let open dropdowns take Escape first
      if (e.key === "Escape" && !document.querySelector(".app-chip-menu")) close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <StartContext.Provider value={{ openStart }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="app-dialog-scrim"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.div
              className="app-dialog start-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="start-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 8, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <button className="app-icon-btn start-dialog-close" onClick={close} aria-label="Close">
                <X size={16} strokeWidth={1.75} />
              </button>
              <div className="start-dialog-head">
                <h2 id="start-title">Start a focus session</h2>
                <p>What do you want to accomplish?</p>
              </div>
              <StartCard autoFocus initialGoalId={opts.goalId} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </StartContext.Provider>
  );
}
