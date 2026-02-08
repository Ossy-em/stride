'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

// Navbar Component
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0f2a1f]/95 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#1a3a2f]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-white">Stride</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href="/waitlist"
              className="px-4 py-2 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors"
            >
              Join Waitlist
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/70"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-2 text-white/70 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/waitlist"
              className="block mt-4 w-full py-2.5 text-center text-[#1a3a2f] font-medium bg-lime-400 rounded-full"
            >
              Join Waitlist
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen pt-20 pb-12 overflow-hidden bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35]">
      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(132,204,22,0.1)_0%,_transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Social Proof Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8 pt-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/10">
            {/* Avatar Stack */}
            <div className="flex -space-x-2">
              <Image
                src="/assets/avatars/avatar-1.png"
                alt="User"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-[#143527] object-cover"
              />
              <Image
                src="/assets/avatars/avatar-2.png"
                alt="User"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-[#143527] object-cover"
              />
              <Image
                src="/assets/avatars/avatar-3.png"
                alt="User"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-[#143527] object-cover"
              />
            </div>
            <span className="text-sm text-white/80">Join others staying focused</span>
            <a href="#testimonials" className="text-sm text-lime-400 hover:text-lime-300 flex items-center gap-1">
              See how <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-6"
>
  Focus Loss Isn't Random.
  <br />
  <span className="text-lime-400">Stride Learns When It Happens.</span>
</motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/60 max-w-2xl mx-auto mb-8"
          >
            Stride learns your focus patterns and nudges you right before you drift.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors"
            >
              Join Waitlist
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
            >
              See how it works
            </a>
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative mt-16"
        >
          <div className="flex justify-center items-center gap-6 lg:gap-12">
            {/* Floating UI Card - Left */}
            <div className="hidden lg:block">
              <div className="w-48 p-4 bg-[#1a3a2f] rounded-2xl border border-white/10 shadow-2xl transform -rotate-6">
                <p className="text-xs text-white/50 mb-1">Focus Sessions</p>
                <p className="text-xl font-bold text-lime-400">+127</p>
                <div className="mt-3 h-16 bg-gradient-to-t from-lime-400/20 to-transparent rounded-lg flex items-end justify-around px-2">
                  {[40, 60, 45, 80, 65, 90, 75].map((h, i) => (
                    <div key={i} className="w-3 bg-lime-400/60 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating UI Card - Right */}
            <div className="hidden lg:block">
              <div className="w-44 p-4 bg-[#1a3a2f] rounded-2xl border border-white/10 shadow-2xl transform rotate-6">
                <p className="text-xs text-white/50 mb-2">Focus Score</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#ffffff10" strokeWidth="4" />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#84cc16"
                        strokeWidth="4"
                        strokeDasharray={`${74 * 1.26} 126`}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">74%</p>
                    <p className="text-xs text-white/40">This week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Bento Features Section
function BentoFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" ref={ref} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Two Column Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          <motion.div variants={fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Focus That Learns
              <br />
              <span className="text-[#1a3a2f]">How You Work</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex flex-col justify-center">
            <p className="text-gray-600 mb-4">
              Stride builds your focus fingerprint and uses it to help you stay on track.
            </p>
            <div className="flex gap-3">
              <a
                href="/waitlist"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#1a3a2f] rounded-full hover:bg-[#0f2a1f] transition-colors"
              >
                Join waitlist
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
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
          className="grid md:grid-cols-3 gap-4"
        >
          {/* Card 1: Analytics Chart */}
          <motion.div
            variants={fadeInUp}
            className="p-6 bg-gray-50 rounded-3xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Focus Fingerprint</h3>
            <p className="text-sm text-gray-600 mb-4">
              See when you drift, why you drift, and what helps you recover.
            </p>
            <div className="h-40 bg-white rounded-2xl border border-gray-100 flex items-end justify-around p-4">
              {[45, 65, 50, 85, 70, 90, 60].map((h, i) => (
                <div key={i} className="relative">
                  <div
                    className={`w-6 rounded-t transition-all ${i === 5 ? 'bg-lime-500' : 'bg-lime-400/60'}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: Integrations Coming Soon */}
          <motion.div
            variants={fadeInUp}
            className="p-6 bg-gray-50 rounded-3xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrations Coming Soon</h3>
            <p className="text-sm text-gray-600 mb-4">
              We're building connections to your favorite tools. Join the waitlist to vote on what we build first.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {['?', '?', '?', '?', '?', '?'].map((icon, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-300"
                >
                  {icon}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Focus Prediction */}
          <motion.div
            variants={fadeInUp}
            className="p-6 bg-gray-50 rounded-3xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Predictive Nudges</h3>
            <p className="text-sm text-gray-600 mb-4">
              Stride learns your patterns and steps in before you lose focus.
            </p>
            <div className="h-32 bg-white rounded-2xl border border-gray-100 p-4 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 Q30,50 60,40 T120,30 T180,45 L200,50 L200,80 L0,80 Z"
                  fill="url(#focusGradient)"
                />
                <path
                  d="M0,60 Q30,50 60,40 T120,30 T180,45"
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="2"
                />
                <path
                  d="M180,45 L200,50"
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
              </svg>
            </div>
          </motion.div>

          {/* Card 4: Smart Interventions - Large */}
          <motion.div
            variants={fadeInUp}
            className="md:col-span-2 p-6 bg-gray-50 rounded-3xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Interventions</h3>
            <p className="text-sm text-gray-600 mb-4">
              Personalized nudges from breathing exercises to movement prompts.
            </p>
            <Image
              src="/assets/features/lifestyle-intervention.jpg"
              alt="Person taking mindful break at desk"
              width={560}
              height={200}
              className="w-full h-48 object-cover rounded-2xl"
            />
          </motion.div>

          {/* Card 5: All-in-one */}
          <motion.div
            variants={fadeInUp}
            className="p-6 bg-gray-50 rounded-3xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">One Tool, No Clutter</h3>
            <p className="text-sm text-gray-600 mb-4">
              No plugins. No extensions. Just focus.
            </p>
            <div className="h-36 bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/features/growth-plant.png"
                alt="Growth illustration"
                width={200}
                height={160}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Feature Sections (Alternating)
function FeatureSections() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
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
        'Not random reminders. Stride uses your focus fingerprint to step in at the right moment with the right message.',
      benefits: ['Breathing Exercises', 'Movement Prompts', 'Micro-breaks'],
      imagePosition: 'left',
      image: '/assets/features/feature-stretch.jpg',
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="space-y-24"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                feature.imagePosition === 'left' ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className={feature.imagePosition === 'left' ? 'md:order-2' : ''}>
                <span className="inline-block px-3 py-1 text-xs font-medium text-[#1a3a2f] bg-lime-100 rounded-full mb-4">
                  {feature.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-lime-500" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div className={feature.imagePosition === 'left' ? 'md:order-1' : ''}>
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={400}
                  height={350}
                  className="w-full rounded-3xl"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      quote:
        'Stride knows when I need a break before I do. My deep work sessions have doubled since I started using it.',
      category: 'Engineering',
    },
    {
      name: 'Marcus Johnson',
      role: 'Content Creator',
      quote:
        "As a writer, focus is everything. Stride's gentle nudges help me stay in the zone for hours.",
      category: 'Creative Work',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Product Manager',
      quote:
        'The patterns helped me understand my focus. I now structure my entire day around my natural energy cycles.',
      category: 'Productivity',
    },
  ];

  return (
    <section id="testimonials" ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            What Early Users Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real feedback from people testing Stride.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="bg-[#1a3a2f] rounded-xl px-4 py-3 mb-4">
                  <p className="text-white font-medium text-sm">{testimonial.name}</p>
                  <p className="text-white/60 text-xs">{testimonial.role}</p>
                </div>
                <p className="text-sm font-medium text-lime-600 mb-2">{testimonial.category}</p>
                <p className="text-gray-700 text-sm leading-relaxed">"{testimonial.quote}"</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="text-center mt-12"
        >
          <a
            href="/waitlist"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[#1a3a2f] rounded-full hover:bg-[#0f2a1f] transition-colors"
          >
            Join Waitlist
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does Stride know when I will lose focus?',
      answer:
        'Stride checks in during your sessions and asks how you feel. Over time, it spots patterns like when you usually drift, what causes it, and what helps. Then it uses that to nudge you before it happens.',
    },
    {
      question: 'What kind of nudges does Stride send?',
      answer:
        'Short, calm messages. Sometimes a quick breathing exercise. Sometimes a stretch. Sometimes just a check-in. You can customize what works for you.',
    },
    {
      question: 'Is my data private?',
      answer:
        'Yes. Your focus data stays yours. We do not sell it or share it with anyone.',
    },
    {
      question: 'Can I customize when Stride checks in?',
      answer:
        'Yes. You can set how often you want nudges, what types you prefer, and block certain hours for uninterrupted work.',
    },
    {
      question: 'When will Stride launch?',
      answer:
        'Soon. Join the waitlist and we will email you when it is ready.',
    },
  ];

  return (
    <section id="faq" ref={ref} className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-12"
        >
          {/* Left: Header + Contact */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Questions?
            </h2>
            <p className="text-gray-600 mb-8">
              Here are answers to the common ones. Still curious? Reach out.
            </p>

            {/* Contact Card */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <MessageSquare className="w-8 h-8 text-[#1a3a2f] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Got More Questions?</h3>
              <p className="text-sm text-gray-600 mb-4">
                We are happy to help.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#1a3a2f] bg-lime-100 rounded-full hover:bg-lime-200 transition-colors"
              >
                Contact us
              </a>
            </div>
          </motion.div>

          {/* Right: FAQ Items */}
          <motion.div variants={fadeInUp} className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 pr-4 text-sm">{faq.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={fadeInUp}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2a1f] via-[#143527] to-[#1a4a35] p-8 md:p-12"
        >
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.15)_0%,_transparent_60%)]" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Focus Better?
              </h2>
              <p className="text-white/60 mb-6">
                Join the waitlist. We will email you when Stride is ready.
              </p>
              <a
                href="/waitlist"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors"
              >
                Join the waitlist
              </a>
            </div>

            {/* Dashboard Preview */}
            <div>
              <div className="bg-[#0f2a1f] rounded-2xl border border-white/10 p-6 transform rotate-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-white/50">Focus Hours</span>
                  <span className="text-xs text-lime-400">This week</span>
                </div>
                <p className="text-3xl font-bold text-white mb-4">12.5 hrs</p>
                <div className="h-24 flex items-end gap-1">
                  {[30, 45, 35, 55, 50, 70, 65].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-lime-400/60 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Logo + Links Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#1a3a2f]" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-gray-900">Stride</span>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              How It Works
            </a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              FAQ
            </a>
            <a href="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">© 2025 Stride. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function StrideLandingPage() {
  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <BentoFeatures />
      <FeatureSections />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}