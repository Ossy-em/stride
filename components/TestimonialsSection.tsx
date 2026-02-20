'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeInUp, staggerContainer } from './animations';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    quote:
      'Stride knows when I need a break before I do. My deep work sessions have doubled since I started using it.',
    category: 'Engineering',
  },
  {
    name: 'Alex',
    role: 'Student',
    quote:
      'I just finished my first session and it was super helpful! I loved the quick note feature and tracking my completed goals — it\'s like having a study companion.',
    category: 'Focus & Productivity',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Product Manager',
    quote:
      'The patterns helped me understand my focus. I now structure my entire day around my natural energy cycles.',
    category: 'Productivity',
  },
];

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="testimonials" ref={ref} className="py-20 sm:py-28 bg-[#fafbfa] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, #1a3a2f 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-14 sm:mb-16"
        >
          <h2 className="text-[1.6rem] sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            What Users Are Saying
          </h2>
          <p className="text-gray-500 text-[15px] max-w-md mx-auto">
            Real feedback from people using Stride to stay focused.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-[0_8px_40px_rgba(0,0,0,0.04)] transition-all duration-500"
            >
              <div className="p-6">
                {/* Name header */}
                <div className="bg-gradient-to-br from-[#0f2a1f] to-[#1a4a35] rounded-xl px-4 py-3.5 mb-5">
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{t.role}</p>
                </div>

                {/* Category tag */}
                <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-lime-600 mb-3">
                  {t.category}
                </span>

                {/* Quote */}
                <div className="relative">
                  <span className="absolute -top-2 -left-1 text-4xl text-lime-300/30 font-serif leading-none">&ldquo;</span>
                  <p className="text-gray-600 text-[13.5px] leading-relaxed pl-4">
                    {t.quote}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mt-12"
        >
          <a
            href="/auth/signin"
            className="inline-flex items-center justify-center px-6 py-3 text-[13px] font-semibold text-white bg-[#1a3a2f] rounded-full hover:bg-[#0f2a1f] transition-colors duration-300 hover:shadow-[0_4px_20px_rgba(26,58,47,0.2)]"
          >
            Try Stride Free
          </a>
        </motion.div>
      </div>
    </section>
  );
}