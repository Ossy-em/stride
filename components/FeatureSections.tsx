'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { fadeInUp, slideInLeft, slideInRight, staggerContainer } from './animations';

interface Feature {
  badge: string;
  title: string;
  description: string;
  benefits: string[];
  imagePosition: 'left' | 'right';
  image: string;
}

const features: Feature[] = [
  {
    badge: 'Focus Fingerprint',
    title: 'Your Patterns. Your Insights.',
    description:
      'Stride checks in during your sessions. You tell it how you feel. Over time, it builds a picture of when you drift, why you drift, and what brings you back.',
    benefits: ['Pattern Learning', 'Smart Timing', 'Personal Insights'],
    imagePosition: 'right',
    image: '/assets/features/ai-prediction.png',
  },
  {
    badge: 'Smart Interventions',
    title: 'Nudges That Actually Help',
    description:
      "Not random reminders. Stride uses your focus fingerprint to step in at the right moment with the right message.",
    benefits: ['Breathing Exercises', 'Movement Prompts', 'Micro-breaks'],
    imagePosition: 'left',
    image: '/assets/features/feature-stretch.jpg',
  },
];

function FeatureBlock({ feature }: { feature: Feature }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isLeft = feature.imagePosition === 'left';

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className="grid md:grid-cols-2 gap-10 sm:gap-14 items-center"
    >
      {/* Text */}
      <motion.div
        variants={isLeft ? slideInRight : slideInLeft}
        className={isLeft ? 'md:order-2' : ''}
      >
        <motion.span
          variants={fadeInUp}
          className="inline-block px-3.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#1a3a2f] bg-lime-100 rounded-full mb-5"
        >
          {feature.badge}
        </motion.span>
        <h3 className="text-xl sm:text-2xl lg:text-[1.85rem] font-bold text-gray-900 mb-4 leading-tight tracking-tight">
          {feature.title}
        </h3>
        <p className="text-gray-500 text-[15px] leading-relaxed mb-7">
          {feature.description}
        </p>
        <ul className="space-y-3.5">
          {feature.benefits.map((benefit, i) => (
            <motion.li
              key={benefit}
              variants={fadeInUp}
              custom={i}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
              </div>
              <span className="text-gray-700 text-[14px] font-medium">{benefit}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Image */}
      <motion.div
        variants={isLeft ? slideInLeft : slideInRight}
        className={isLeft ? 'md:order-1' : ''}
      >
        <div className="relative group">
          {/* Shadow/glow behind image */}
          <div className="absolute -inset-4 bg-gradient-to-br from-lime-400/10 to-emerald-400/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Image
            src={feature.image}
            alt={feature.title}
            width={500}
            height={400}
            className="relative w-full rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_50px_rgba(0,0,0,0.08)] transition-shadow duration-500"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FeatureSections() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-20 sm:space-y-28">
        {features.map((feature) => (
          <FeatureBlock key={feature.title} feature={feature} />
        ))}
      </div>
    </section>
  );
}