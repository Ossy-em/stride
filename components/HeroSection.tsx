'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Bell, TrendingUp } from 'lucide-react';

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-lime-400/30 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.7,
          }}
        />
      ))}
    </div>
  );
}

function HeroPills() {
  const pills = [
    { icon: Brain, label: 'Learns You', sub: 'Builds your focus profile' },
    { icon: Bell, label: 'Nudges You', sub: 'Before you lose focus' },
    { icon: TrendingUp, label: 'Gets Smarter', sub: 'Adapts to your patterns' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-3 gap-3 sm:gap-5 max-w-2xl mx-auto mt-14 sm:mt-20 px-2"
    >
      {pills.map((pill, i) => {
        const Icon = pill.icon;
        return (
          <motion.div
            key={pill.label}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-center cursor-default
              bg-white/[0.04] border border-white/[0.06]
              hover:bg-white/[0.07] hover:border-lime-400/20
              transition-colors duration-500"
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_rgba(163,230,53,0.06)_0%,_transparent_70%)]" />
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl sm:rounded-2xl bg-lime-400/10 flex items-center justify-center group-hover:bg-lime-400/15 transition-colors duration-300">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white tracking-wide">{pill.label}</p>
              <p className="text-[10px] sm:text-xs text-white/30 mt-1 hidden sm:block">{pill.sub}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a1f16]">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Top gradient orb */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,_rgba(132,204,22,0.12)_0%,_rgba(132,204,22,0.04)_40%,_transparent_70%)]" />
        {/* Bottom subtle gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0d2a1c] to-transparent" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <FloatingParticles />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-16">
        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
            <div className="flex -space-x-2.5">
              {[1, 2, 3].map((n) => (
                <Image
                  key={n}
                  src={`/assets/avatars/avatar-${n}.png`}
                  alt="User"
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full border-2 border-[#0a1f16] object-cover"
                />
              ))}
            </div>
            <span className="text-xs sm:text-[13px] text-white/50 tracking-wide">
              People are already focusing better
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] font-bold text-white leading-[1.1] mb-5 sm:mb-6 tracking-tight px-2"
          >
            Focus Loss Isn't Random.
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400">
                Stride Predicts It.
              </span>
              {/* Glow behind text */}
              <span className="absolute inset-0 blur-2xl bg-lime-400/20 -z-10" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="text-[15px] sm:text-lg text-white/40 max-w-xl sm:max-w-2xl mx-auto mb-9 leading-relaxed tracking-wide px-4"
          >
            Stride learns your focus patterns and nudges you right before you drift. Not after.{' '}
            <span className="text-white/60 font-medium">Before.</span>
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 justify-center px-6 sm:px-0"
          >
            <a
              href="/auth/signin"
              className="group relative inline-flex items-center justify-center gap-2 px-7 py-4 text-[15px] font-semibold text-[#0a1f16] bg-lime-400 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(163,230,53,0.25)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Focusing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
              <span className="absolute inset-0 bg-lime-300 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-[15px] font-medium text-white/60 border border-white/10 rounded-full hover:bg-white/[0.04] hover:border-white/15 hover:text-white/80 transition-all duration-300"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-[11px] sm:text-xs text-white/25 mt-5 tracking-widest uppercase"
          >
           Desktop & Mobile
          </motion.p>
        </div>

        {/* Feature pills */}
        <HeroPills />
      </div>
    </section>
  );
}