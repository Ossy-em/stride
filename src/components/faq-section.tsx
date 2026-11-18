"use client";
import { faqs } from "@/lib/faqs";

/**
 * FAQ: questions left, list right.
 * Left column holds the title at the top and the contact prompt lower down;
 * the list is large questions on white hairline dividers, + turns to x.
 * Hovering a row mutes it, like the reference.
 */

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Button from "./ui/button";

// questions live in lib/faqs so search engines get the same answers (see app/page.tsx)

const EASE = [0.22, 1, 0.36, 1] as const;

const Plus = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 3.5v13M3.5 10h13" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" />
  </svg>
);

function FAQItem({
  faq,
  isOpen,
  onToggle,
  id,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="faq-item" data-open={isOpen}>
      <button
        type="button"
        onClick={onToggle}
        className="faq-trigger"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span className="faq-q t-subtitle">{faq.question}</span>
        <motion.span
          className="faq-icon"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: reduced ? 0 : 0.25, ease: EASE }}
        >
          <Plus />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p className="faq-a t-body">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
    <section id="faq" className="faq section">
      <style>{`
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-areas: "title" "list" "contact";
          row-gap: var(--head-gap);
        }
        .faq-title { grid-area: title; }
        .faq-list { grid-area: list; }
        .faq-contact { grid-area: contact; }

        .faq-contact .t-body { margin: var(--stack-xs) 0 var(--stack-md); }

        /* rows: white hairline under each question */
        .faq-item { box-shadow: inset 0 calc(-1 * var(--hair)) 0 var(--hair-color); }
        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--stack-md);
          padding: var(--stack-md) 0;
          background: none;
          border: none;
          text-align: left;
          font-family: inherit;
          color: var(--ink);
          cursor: pointer;
        }
        .faq-list > .faq-item:first-child .faq-trigger { padding-top: 0; }
        .faq-q, .faq-icon { transition: color var(--dur) ease; }
        .faq-icon {
          flex-shrink: 0;
          width: 20px; height: 20px;
          color: var(--ink);
          display: block;
        }
        .faq-icon svg { width: 100%; height: 100%; display: block; }

        /* hover mutes the row; the open row stays bright */
        @media (hover: hover) {
          .faq-item:not([data-open="true"]) .faq-trigger:hover .faq-q,
          .faq-item:not([data-open="true"]) .faq-trigger:hover .faq-icon { color: var(--quiet); }
        }
        .faq-trigger:focus-visible { outline: 2px solid var(--ink); outline-offset: 4px; border-radius: 4px; }

        .faq-item[data-open="true"] .faq-trigger { padding-bottom: var(--stack-sm); }
        .faq-a { padding: 0 44px var(--stack-md) 0; }

        @media (min-width: 768px) {
          .faq-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto 1fr;
            grid-template-areas: "title list" "contact list";
            column-gap: var(--grid-gap);
            row-gap: 0;
          }
          /* contact sits well below the title, as in the reference */
          .faq-contact { align-self: start; margin-top: calc(var(--head-gap) * 2); }
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-q, .faq-icon { transition: none; }
        }
      `}</style>

      <motion.div className="faq-grid l-inner" {...reveal}>
        <h2 className="faq-title t-title">Questions?</h2>

        <div className="faq-contact">
          <h3 className="t-subtitle">Got more questions?</h3>
          <p className="t-body">We&apos;re happy to help.</p>
          <Button href="mailto:hello@trystrideai.com" variant="solidLight" size="md">
            Contact us
          </Button>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              id={`faq-panel-${index}`}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
