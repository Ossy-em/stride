'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Monitor,
  Smartphone,
  Bell,
  Brain,
  BarChart3,
  Zap,
  Shield,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from './animations';

function ChartBars() {
  const heights = [45, 65, 50, 85, 70, 90, 60];
  return (
    <div className="h-36 sm:h-40 bg-white rounded-2xl border border-gray-100/80 flex items-end justify-around p-4 gap-1">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`w-5 sm:w-6 rounded-t-md ${
            i === 5 ? 'bg-lime-500 shadow-[0_-4px_12px_rgba(132,204,22,0.3)]' : 'bg-lime-400/50'
          }`}
        />
      ))}
    </div>
  );
}

function FocusCurve() {
  return (
    <div className="h-32 bg-white rounded-2xl border border-gray-100/80 p-4 relative overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#84cc16" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,60 Q30,50 60,40 T120,30 T180,45 L200,50 L200,80 L0,80 Z"
          fill="url(#focusGrad)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />
        <motion.path
          d="M0,60 Q30,50 60,40 T120,30 T180,45"
          fill="none"
          stroke="#84cc16"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
        />
        <motion.path
          d="M180,45 L200,50"
          fill="none"
          stroke="#84cc16"
          strokeWidth="2"
          strokeDasharray="4,4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4 }}
        />
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
        >
          <circle cx="130" cy="32" r="5" fill="#84cc16" />
          <circle cx="130" cy="32" r="8" fill="none" stroke="#84cc16" strokeWidth="1" opacity="0.3" />
          <text x="130" y="20" textAnchor="middle" fill="#84cc16" fontSize="8" fontWeight="bold">
            nudge
          </text>
        </motion.g>
      </svg>
    </div>
  );
}

function InterventionCard() {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-gray-100/80 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-lime-100 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-lime-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 mb-0.5">Stride — Focus Check</p>
          <p className="text-[13px] text-gray-500 leading-relaxed">How&apos;s the flow going? Still locked in?</p>
          <div className="flex gap-2 mt-3">
            {['Focused', 'Drifting', 'Need a break'].map((label, i) => (
              <motion.span
                key={label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-colors duration-200 ${
                  i === 0
                    ? 'bg-lime-100 text-lime-700 hover:bg-lime-200'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                {label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCard({
  children,
  className = '',
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`group relative p-5 sm:p-6 rounded-3xl border border-gray-100/80 bg-gray-50/50 hover:bg-white hover:shadow-[0_8px_40px_rgba(0,0,0,0.04)] hover:border-gray-200/80 transition-all duration-500 ${className}`}
    >
      <h3 className="text-[15px] sm:text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">{description}</p>
      {children}
    </motion.div>
  );
}

export default function BentoFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const platforms = [
    { icon: Monitor, label: 'Desktop' },
    { icon: Smartphone, label: 'Mobile' },
    { icon: Bell, label: 'Push' },
    { icon: Brain, label: 'AI' },
    { icon: BarChart3, label: 'Insights' },
    { icon: Zap, label: 'Fast' },
  ];

  return (
    <section id="features" ref={ref} className="py-20 sm:py-28 bg-white relative">
      {/* Subtle top divider gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-14 sm:mb-16"
        >
          <motion.div variants={fadeInUp}>
            <h2 className="text-[1.6rem] sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.15] tracking-tight">
              Focus That Learns
              <br />
              <span className="text-[#1a3a2f]">How You Work</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex flex-col justify-center">
            <p className="text-gray-500 text-[15px] leading-relaxed mb-5">
              Stride builds your focus fingerprint and uses it to help you stay on track — adapting to your unique rhythms.
            </p>
            <div className="flex gap-3">
              <a
                href="/auth/signin"
                className="inline-flex items-center justify-center px-5 py-2.5 text-[13px] font-semibold text-white bg-[#1a3a2f] rounded-full hover:bg-[#0f2a1f] transition-colors duration-300"
              >
                Try it free
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-5 py-2.5 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors duration-300"
              >
                Learn more
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {/* Focus Fingerprint */}
          <FeatureCard
            title="Your Focus Fingerprint"
            description="See when you drift, why you drift, and what helps you recover."
          >
            <ChartBars />
          </FeatureCard>

          {/* Works Everywhere */}
          <FeatureCard
            title="Works Everywhere"
            description="Desktop, mobile, background. Stride reaches you even when you switch apps."
          >
            <div className="grid grid-cols-3 gap-2.5">
              {platforms.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="h-12 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center hover:border-lime-300 hover:shadow-sm transition-all duration-300"
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 text-gray-600" />
                  </motion.div>
                );
              })}
            </div>
          </FeatureCard>

          {/* Predictive Nudges */}
          <FeatureCard
            title="Predictive Nudges"
            description="Stride learns your patterns and steps in before you lose focus."
          >
            <FocusCurve />
          </FeatureCard>

          {/* Smart Interventions (wide) */}
          <FeatureCard
            className="sm:col-span-2"
            title="Smart Interventions"
            description="Personalized check-ins that feel like a calm friend, not a nagging app."
          >
            <InterventionCard />
          </FeatureCard>

          {/* Privacy */}
          <FeatureCard
            title="Privacy First"
            description="Your focus data stays yours. We don't sell or share it."
          >
            <div className="h-36 bg-white rounded-2xl border border-gray-100/80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(132,204,22,0.05)_0%,_transparent_70%)]" />
              <Shield className="w-16 h-16 text-lime-400/25" />
            </div>
          </FeatureCard>
        </motion.div>
      </div>
    </section>
  );
}