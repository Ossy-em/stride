"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "./animations";
import Button from "./ui/Button";

const faqs = [
  {
    question: "How does Stride know when I will lose focus?",
    answer:
      "Stride checks in during your sessions and asks how you feel. Over time, it spots patterns like when you usually drift, what causes it, and what helps. Then it uses that to nudge you before it happens.",
  },
  {
    question: "What kind of nudges does Stride send?",
    answer:
      "Short, calm messages. Sometimes a quick breathing exercise. Sometimes a stretch. Sometimes just a check-in. The more you use it, the more personalized they get.",
  },
  {
    question: "Is Stride free?",
    answer:
      "Stride has a free plan with 3 sessions per day (up to 30 minutes each). For unlimited sessions, longer durations, smarter AI, and your full Focus Fingerprint, you can upgrade to Premium for $6/month or $58/year.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. On iPhone, add Stride to your home screen from Safari for the best experience, including push notifications when you leave the app.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your focus data stays yours. We do not sell it or share it with anyone. See our Privacy Policy for details.",
  },
];

const Chevron = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M6 3.25 10.75 8 6 12.75"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Bubble = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M3 4.75h14v9.25H8.75L5 17v-3H3z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
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
  return (
    <motion.div variants={fadeInUp} className="faq-item" data-open={isOpen}>
      <button
        type="button"
        onClick={onToggle}
        className="faq-trigger"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <span className="faq-q">{faq.question}</span>
        <motion.span
          className="faq-chevron"
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Chevron />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="faq-a-wrap">
              <span className="faq-divider" />
              <p className="faq-a">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" ref={ref} className="faq section">
      <style>{`
        .faq { font-family: var(--font-sans); }

        .faq-inner {
          max-width: var(--maxw);
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--s-7);
        }

        /* ---- left ---- */
        .faq-h2 {
          margin: 0 0 var(--s-3);
          font-weight: var(--fw-bold);
          font-size: var(--fs-h2);
          line-height: var(--lh-h2);
          letter-spacing: var(--ls-h2);
          color: var(--ink);
        }
        .faq-lead {
          margin: 0 0 var(--s-6);
          font-size: var(--fs-body);
          font-weight: var(--fw-regular);
          line-height: var(--lh-body);
          color: var(--body);
          max-width: 34ch;
        }

        .faq-card {
          padding: var(--s-5);
          border-radius: var(--radius-card);
          border: 0.5px solid var(--rule);
          background: var(--surface);
          transition: border-color var(--dur-slow) ease, box-shadow var(--dur-slow) ease;
        }
        .faq-card:hover {
          border-color: var(--rule-hover);
          box-shadow: 0 10px 34px rgba(16, 34, 28, 0.06);
        }
        .faq-card-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: rgba(16, 34, 28, 0.05);
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--s-4);
        }
        .faq-card-icon svg { width: 20px; height: 20px; display: block; }
        .faq-card h3 {
          margin: 0 0 var(--s-1);
          font-size: var(--fs-h4);
          font-weight: var(--fw-semibold);
          line-height: var(--lh-h4);
          letter-spacing: var(--ls-h4);
          color: var(--ink);
        }
        .faq-card p {
          margin: 0 0 var(--s-5);
          font-size: var(--fs-sm);
          font-weight: var(--fw-regular);
          line-height: var(--lh-sm);
          color: var(--quiet);
        }

        /* ---- accordion ---- */
        .faq-list { display: flex; flex-direction: column; gap: var(--s-3); }

        .faq-item {
          border: 0.5px solid var(--rule);
          border-radius: var(--radius-card);
          overflow: hidden;
          background: var(--surface);
          transition: border-color var(--dur) ease;
        }
        .faq-item:hover { border-color: var(--rule-hover); }
        .faq-item[data-open="true"] { border-color: var(--rule-hover); }

        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--s-4);
          padding: 18px var(--s-5);
          background: none;
          border: none;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
        }
        .faq-trigger:focus-visible { outline: 2px solid var(--ink); outline-offset: -2px; border-radius: var(--radius-card); }

        .faq-q {
          font-size: var(--fs-h4);
          font-weight: var(--fw-medium);
          line-height: 1.4;
          letter-spacing: var(--ls-h4);
          color: var(--ink);
        }
        .faq-chevron {
          flex-shrink: 0;
          width: 16px; height: 16px;
          color: var(--quiet);
          display: block;
          transition: color var(--dur) ease;
        }
        .faq-chevron svg { width: 100%; height: 100%; display: block; }
        .faq-item[data-open="true"] .faq-chevron,
        .faq-trigger:hover .faq-chevron { color: var(--ink); }

        .faq-a-wrap { padding: 0 var(--s-5) var(--s-5); }
        .faq-divider {
          display: block;
          height: 0.5px;
          background: var(--edge);
          margin-bottom: var(--s-4);
        }
        .faq-a {
          margin: 0;
          font-size: 14px;
          font-weight: var(--fw-regular);
          line-height: 1.6;
          color: var(--body);
          max-width: 60ch;
        }

        @media (min-width: 768px) {
          .faq-inner { grid-template-columns: 0.85fr 1.15fr; gap: 7%; }
          .faq-card { padding: var(--s-6); }
          .faq-trigger { padding: var(--s-5) 22px; }
          .faq-a-wrap { padding: 0 22px 22px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .faq-card, .faq-item, .faq-chevron { transition: none; }
        }
      `}</style>

      <motion.div
        className="faq-inner"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        {/* left — header + contact */}
        <motion.div variants={fadeInUp}>
          <h2 className="faq-h2">Questions?</h2>
          <p className="faq-lead">
            Here are answers to the common ones. Still curious? Reach out.
          </p>

          <div className="faq-card">
            <div className="faq-card-icon">
              <Bubble />
            </div>
            <h3>Got more questions?</h3>
            <p>We&apos;re happy to help.</p>
            <Button href="mailto:hello@trystrideai.com" size="sm">
              Contact us
            </Button>
          </div>
        </motion.div>

        {/* right — accordion */}
        <motion.div
          className="faq-list"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              id={`faq-panel-${index}`}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}