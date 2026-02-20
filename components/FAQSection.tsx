'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { fadeInUp, staggerContainer } from './animations';

const faqs = [
  {
    question: 'How does Stride know when I will lose focus?',
    answer:
      "Stride checks in during your sessions and asks how you feel. Over time, it spots patterns like when you usually drift, what causes it, and what helps. Then it uses that to nudge you before it happens.",
  },
  {
    question: 'What kind of nudges does Stride send?',
    answer:
      'Short, calm messages. Sometimes a quick breathing exercise. Sometimes a stretch. Sometimes just a check-in. The more you use it, the more personalized they get.',
  },
  {
    question: 'Is Stride free?',
    answer:
      'Stride has a free plan with 3 sessions per day (up to 30 minutes each). For unlimited sessions, longer durations, smarter AI, and your full Focus Fingerprint, you can upgrade to Premium for $8/month or $79/year.',
  },
  {
    question: 'Does it work on mobile?',
    answer:
      'Yes. On iPhone, add Stride to your home screen from Safari for the best experience, including push notifications when you leave the app.',
  },
  {
    question: 'Is my data private?',
    answer:
      'Yes. Your focus data stays yours. We do not sell it or share it with anyone. See our Privacy Policy for details.',
  },
  {
    question: 'Can I cancel my Premium subscription?',
    answer:
      'Yes, cancel anytime. Your premium features stay active until the end of your billing period. No questions asked.',
  },
];

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white hover:border-gray-300/80 transition-colors duration-300"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <span className="font-medium text-gray-900 pr-4 text-[14px] group-hover:text-[#1a3a2f] transition-colors duration-300">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-lime-500 transition-colors duration-300" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="h-px bg-gray-100 mb-4" />
              <p className="text-gray-500 text-[13.5px] leading-relaxed">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" ref={ref} className="py-20 sm:py-28 bg-[#fafbfa]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-10 sm:gap-14"
        >
          {/* Left - Header + Contact */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-[1.6rem] sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Questions?
            </h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
              Here are answers to the common ones. Still curious? Reach out.
            </p>
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.03)] transition-all duration-500"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1a3a2f]/5 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5 text-[#1a3a2f]" />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">Got More Questions?</h3>
              <p className="text-[13px] text-gray-400 mb-4">We&apos;re happy to help.</p>
              <a
                href="mailto:hello@trystrideai.com"
                className="inline-flex items-center justify-center px-4 py-2.5 text-[13px] font-semibold text-[#1a3a2f] bg-lime-100 rounded-full hover:bg-lime-200 transition-colors duration-300"
              >
                Contact us
              </a>
            </motion.div>
          </motion.div>

          {/* Right - Accordion */}
          <motion.div
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="space-y-3"
          >
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}