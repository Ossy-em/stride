'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeInUp } from './animations';

function MiniDashboard() {
  const bars = [30, 45, 35, 55, 50, 70, 65];

  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, rotate: 2, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#071510] rounded-2xl border border-white/[0.08] p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] text-white/30">Focus Score</span>
        <span className="text-[11px] text-lime-400/60 font-medium">This week</span>
      </div>
      <p className="text-3xl font-bold text-white mb-5 tracking-tight">
        8.2<span className="text-lg text-white/25">/10</span>
      </p>
      <div className="h-24 flex items-end gap-1.5">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 bg-lime-400/40 rounded-t hover:bg-lime-400/60 transition-colors duration-300"
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-14 sm:py-20 bg-gradient-to-b from-[#fafbfa] to-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1f16] via-[#0f2a1f] to-[#1a4a35]"
        >
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.1)_0%,_transparent_60%)]" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 p-7 sm:p-10 md:p-14">
            <div className="md:grid md:grid-cols-2 gap-10 items-center">
              {/* Text */}
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h2 className="text-xl sm:text-2xl lg:text-[1.85rem] font-bold text-white mb-4 tracking-tight leading-tight">
                  Ready to Focus Better?
                </h2>
                <p className="text-white/35 text-[15px] mb-7 leading-relaxed">
                  Start your first session in under 30 seconds. Free to get started.
                </p>
                <a
                  href="/auth/signin"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[14px] font-semibold text-[#0a1f16] bg-lime-400 rounded-full hover:bg-lime-300 transition-all duration-300 hover:shadow-[0_0_30px_rgba(163,230,53,0.25)]"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </a>
              </div>

              {/* Mini dashboard */}
              <div className="hidden md:block">
                <MiniDashboard />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}