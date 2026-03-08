'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Crown } from 'lucide-react';
import { fadeInUp, staggerContainer } from './animations';

const freeFeatures = [
  '3 focus sessions per day',
  'Up to 30 min per session',
  'Basic AI nudges',
  'Growth stats on dashboard',
  'Push notifications',
];

const premiumFeatures = [
  'Unlimited focus sessions',
  'Up to 3 hours per session',
  'Advanced AI (smarter nudges)',
  'Full Focus Fingerprint',
  'Pause & resume sessions',
  'Full session history',
  'Data export',
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" ref={ref} className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-[1.6rem] sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-500 text-[15px] max-w-md mx-auto">
            Start free. Upgrade when you want more.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="flex justify-center mb-10 sm:mb-12"
        >
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 text-[13px] font-medium rounded-full transition-all duration-300 ${
                billing === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 text-[13px] font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                billing === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Yearly
              <AnimatePresence>
                {billing === 'yearly' && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-[11px] text-lime-600 font-bold"
                  >
                    Save 20%
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto"
        >
          {/* Free */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="p-7 sm:p-8 bg-gray-50/80 rounded-3xl border border-gray-200/80 hover:border-gray-300 transition-all duration-400"
          >
            <p className="text-[13px] font-semibold text-gray-400 tracking-wider uppercase mb-3">Free</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900 tracking-tight">$0</span>
              <span className="text-gray-400 text-sm">/forever</span>
            </div>
            <p className="text-[13px] text-gray-400 mb-7">Great for getting started</p>
            <a
              href="/auth/signin"
              className="block w-full py-3 text-center text-[13px] font-semibold text-[#1a3a2f] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 mb-7"
            >
              Get Started Free
            </a>
            <ul className="space-y-3.5">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-200/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-gray-400" />
                  </div>
                  <span className="text-[13.5px] text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Premium */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative p-7 sm:p-8 bg-gradient-to-br from-[#0a1f16] via-[#0f2a1f] to-[#1a4a35] rounded-3xl border-2 border-lime-400/20 hover:border-lime-400/30 transition-all duration-400"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.08)_0%,_transparent_60%)]" />

            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-lime-400 text-[#0a1f16] text-[11px] font-bold tracking-wider uppercase rounded-full shadow-[0_4px_15px_rgba(163,230,53,0.3)]"
              >
                <Crown className="w-3 h-3" />
                Most Popular
              </motion.span>
            </div>

            <div className="relative z-10">
              <p className="text-[13px] font-semibold text-lime-400/60 tracking-wider uppercase mb-3">Premium</p>
              <div className="flex items-baseline gap-1 mb-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={billing}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-4xl font-bold text-white tracking-tight"
                  >
                    ${billing === 'monthly' ? '6' : '58'}
                  </motion.span>
                </AnimatePresence>
                <span className="text-white/30 text-sm">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={billing}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[13px] text-white/25 mb-7"
                >
                  {billing === 'yearly'
                    ? "That's ~$4.83/month, billed annually"
                    : 'Billed monthly, cancel anytime'}
                </motion.p>
              </AnimatePresence>
              <a
                href="/auth/signin?callbackUrl=/premium"
                className="block w-full py-3 text-center text-[13px] font-semibold text-[#0a1f16] bg-lime-400 rounded-xl hover:bg-lime-300 transition-all duration-300 mb-7 hover:shadow-[0_0_25px_rgba(163,230,53,0.25)]"
              >
                Upgrade to Premium
              </a>
              <ul className="space-y-3.5">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-lime-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-lime-400" />
                    </div>
                    <span className="text-[13.5px] text-white/60">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}