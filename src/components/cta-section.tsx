"use client";

/**
 * Closing CTA: one line and one action, centred on the page background.
 */

import Button from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function StrideCTA() {
  const reduced = useReducedMotion();
  const reveal = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: EASE },
      };

  return (
    <section className="cta section">
      <style>{`
        /* exactly one screen tall; the panel fills it and centres */
        .cta.section { height: 100vh; padding-top: 0; padding-bottom: 0; display: flex; }
        .cta-panel {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--stack-md);
          text-align: center;
        }
        .cta-panel .t-title { max-width: 14em; }
      `}</style>

      <motion.div className="cta-panel l-inner" {...reveal}>
        <h2 className="t-title">Start before you drift.</h2>
        <Button href="/sign-in" variant="solidLight" size="md">
          Start a session
        </Button>
      </motion.div>
    </section>
  );
}
