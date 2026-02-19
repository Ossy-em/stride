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
  Brain,
  Bell,
  TrendingUp,
  Shield,
  Monitor,
  Smartphone,
  BarChart3,
  Check,
  Clock,
  Pause,
  Download,
  Sparkles,
  Crown,
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

// Navbar
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
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0f2a1f]/95 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <a href="#">
            <Image src="/icons/icon.png" alt="Stride" width={100} height={28} className="h-12 w-auto" />
          </a>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/auth/signin" className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
              Sign In
            </a>
            <a href="/auth/signin" className="px-4 py-2 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors">
              Get Started Free
            </a>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white/70">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="block py-3 text-white/70 hover:text-white transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <a href="/auth/signin" className="w-full py-3 text-center text-[#1a3a2f] font-medium bg-lime-400 rounded-full">
                Get Started Free
              </a>
              <a href="/auth/signin" className="w-full py-3 text-center text-white/70 font-medium border border-white/20 rounded-full">
                Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen pt-20 pb-12 overflow-hidden bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(132,204,22,0.1)_0%,_transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center mb-6 sm:mb-8 pt-6 sm:pt-8">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-white/10 border border-white/10">
            <div className="flex -space-x-2">
              <Image src="/assets/avatars/avatar-1.png" alt="User" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#143527] object-cover" />
              <Image src="/assets/avatars/avatar-2.png" alt="User" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#143527] object-cover" />
              <Image src="/assets/avatars/avatar-3.png" alt="User" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#143527] object-cover" />
            </div>
            <span className="text-xs sm:text-sm text-white/80">People are already focusing better</span>
          </div>
        </motion.div>

        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-4 sm:mb-6 px-2">
            Focus Loss Isn't Random.
            <br />
            <span className="text-lime-400">Stride Predicts It.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-base sm:text-lg text-white/60 max-w-xl sm:max-w-2xl mx-auto mb-8 px-4">
            Stride learns your focus patterns and nudges you right before you drift. Not after. Before.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-3 justify-center px-6 sm:px-0">
            <a href="/auth/signin" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors">
              Start Focusing
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors">
              See how it works
            </a>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-xs text-white/40 mt-4">
            No credit card required. Works on desktop & mobile.
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="relative mt-12 sm:mt-16 max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 px-2">
            <div className="p-3 sm:p-5 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-lime-400/10 flex items-center justify-center">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-white">Learns You</p>
              <p className="text-[10px] sm:text-xs text-white/40 mt-1 hidden sm:block">Builds your focus profile</p>
            </div>
            <div className="p-3 sm:p-5 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-lime-400/10 flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-white">Nudges You</p>
              <p className="text-[10px] sm:text-xs text-white/40 mt-1 hidden sm:block">Before you lose focus</p>
            </div>
            <div className="p-3 sm:p-5 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-xl bg-lime-400/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-white">Gets Smarter</p>
              <p className="text-[10px] sm:text-xs text-white/40 mt-1 hidden sm:block">Adapts to your patterns</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Bento Features
function BentoFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" ref={ref} className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer} className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Focus That Learns
              <br />
              <span className="text-[#1a3a2f]">How You Work</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex flex-col justify-center">
            <p className="text-gray-600 mb-4">Stride builds your focus fingerprint and uses it to help you stay on track.</p>
            <div className="flex gap-3">
              <a href="/auth/signin" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#1a3a2f] rounded-full hover:bg-[#0f2a1f] transition-colors">
                Try it free
              </a>
              <a href="#how-it-works" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                Learn more
              </a>
            </div>
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer} className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <motion.div variants={fadeInUp} className="p-5 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Your Focus Fingerprint</h3>
            <p className="text-sm text-gray-600 mb-4">See when you drift, why you drift, and what helps you recover.</p>
            <div className="h-36 sm:h-40 bg-white rounded-xl sm:rounded-2xl border border-gray-100 flex items-end justify-around p-4">
              {[45, 65, 50, 85, 70, 90, 60].map((h, i) => (
                <div key={i}>
                  <div className={`w-5 sm:w-6 rounded-t transition-all ${i === 5 ? 'bg-lime-500' : 'bg-lime-400/60'}`} style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="p-5 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Works Everywhere</h3>
            <p className="text-sm text-gray-600 mb-4">Desktop, mobile, background. Stride reaches you even when you switch apps.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Monitor, label: 'Desktop' },
                { icon: Smartphone, label: 'Mobile' },
                { icon: Bell, label: 'Push' },
                { icon: Brain, label: 'AI' },
                { icon: BarChart3, label: 'Insights' },
                { icon: Zap, label: 'Fast' },
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div key={i} className="h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm" title={item.label}>
                    <IconComponent className="w-4 h-4 text-gray-700" />
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="p-5 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Predictive Nudges</h3>
            <p className="text-sm text-gray-600 mb-4">Stride learns your patterns and steps in before you lose focus.</p>
            <div className="h-32 bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#84cc16" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#84cc16" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,60 Q30,50 60,40 T120,30 T180,45 L200,50 L200,80 L0,80 Z" fill="url(#focusGradient)" />
                <path d="M0,60 Q30,50 60,40 T120,30 T180,45" fill="none" stroke="#84cc16" strokeWidth="2" />
                <path d="M180,45 L200,50" fill="none" stroke="#84cc16" strokeWidth="2" strokeDasharray="4,4" />
                <circle cx="130" cy="32" r="4" fill="#84cc16" />
                <text x="130" y="22" textAnchor="middle" fill="#84cc16" fontSize="8" fontWeight="bold">nudge</text>
              </svg>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="sm:col-span-2 p-5 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Smart Interventions</h3>
            <p className="text-sm text-gray-600 mb-4">Personalized check-ins that feel like a calm friend, not a nagging app.</p>
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-lime-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">Stride - Focus Check</p>
                  <p className="text-sm text-gray-600">How's the flow going? Still locked in?</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 text-xs font-medium bg-lime-100 text-lime-700 rounded-full">Focused</span>
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">Drifting</span>
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">Need a break</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="p-5 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-sm text-gray-600 mb-4">Your focus data stays yours. We don't sell it or share it with anyone.</p>
            <div className="h-36 bg-white rounded-xl sm:rounded-2xl border border-gray-100 flex items-center justify-center">
              <Shield className="w-16 h-16 text-lime-400/30" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Feature Sections
function FeatureSections() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      badge: 'Focus Fingerprint',
      title: 'Your Patterns. Your Insights.',
      description: 'Stride checks in during your sessions. You tell it how you feel. Over time, it builds a picture of when you drift, why you drift, and what brings you back.',
      benefits: ['Pattern Learning', 'Smart Timing', 'Personal Insights'],
      imagePosition: 'right',
      image: '/assets/features/ai-prediction.png',
    },
    {
      badge: 'Smart Interventions',
      title: 'Nudges That Actually Help',
      description: 'Not random reminders. Stride uses your focus fingerprint to step in at the right moment with the right message.',
      benefits: ['Breathing Exercises', 'Movement Prompts', 'Micro-breaks'],
      imagePosition: 'left',
      image: '/assets/features/feature-stretch.jpg',
    },
  ];

  return (
    <section id="how-it-works" ref={ref} className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer} className="space-y-16 sm:space-y-24">
          {features.map((feature) => (
            <motion.div key={feature.title} variants={fadeInUp} className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-center ${feature.imagePosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
              <div className={feature.imagePosition === 'left' ? 'md:order-2' : ''}>
                <span className="inline-block px-3 py-1 text-xs font-medium text-[#1a3a2f] bg-lime-100 rounded-full mb-4">{feature.badge}</span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
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
              <div className={feature.imagePosition === 'left' ? 'md:order-1' : ''}>
                <Image src={feature.image} alt={feature.title} width={400} height={350} className="w-full rounded-2xl sm:rounded-3xl" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials
function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const testimonials = [
    { name: 'Sarah Chen', role: 'Software Engineer', quote: 'Stride knows when I need a break before I do. My deep work sessions have doubled since I started using it.', category: 'Engineering' },
    { name: 'Alex', role: 'Student', quote: 'I just finished my first session and it was super helpful! I loved the quick note feature and tracking my completed goals—it like having a study companion. So fun and effective!', category: 'Focus & Productivity' },
    { name: 'Elena Rodriguez', role: 'Product Manager', quote: 'The patterns helped me understand my focus. I now structure my entire day around my natural energy cycles.', category: 'Productivity' },
  ];

  return (
    <section id="testimonials" ref={ref} className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={fadeInUp} className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Users Are Saying</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Real feedback from people using Stride.</p>
        </motion.div>

        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer} className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeInUp} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100">
              <div className="p-5 sm:p-6">
                <div className="bg-[#1a3a2f] rounded-xl px-4 py-3 mb-4">
                  <p className="text-white font-medium text-sm">{t.name}</p>
                  <p className="text-white/60 text-xs">{t.role}</p>
                </div>
                <p className="text-sm font-medium text-lime-600 mb-2">{t.category}</p>
                <p className="text-gray-700 text-sm leading-relaxed">"{t.quote}"</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={fadeInUp} className="text-center mt-10 sm:mt-12">
          <a href="/auth/signin" className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[#1a3a2f] rounded-full hover:bg-[#0f2a1f] transition-colors">
            Try Stride Free
          </a>
        </motion.div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

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

  return (
    <section id="pricing" ref={ref} className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={fadeInUp} className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 max-w-lg mx-auto">Start free. Upgrade when you want more.</p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={fadeInUp} className="flex justify-center mb-8 sm:mb-10">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${billing === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Yearly
              {billing === 'yearly' && <span className="text-xs text-lime-600 font-semibold">Save 18%</span>}
            </button>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <motion.div variants={fadeInUp} className="p-6 sm:p-8 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-2">Free</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500 text-sm">/forever</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">Great for getting started</p>
            <a href="/auth/signin" className="block w-full py-3 text-center text-sm font-semibold text-[#1a3a2f] bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors mb-6">
              Get Started Free
            </a>
            <ul className="space-y-3">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Premium */}
          <motion.div variants={fadeInUp} className="relative p-6 sm:p-8 bg-gradient-to-br from-[#0f2a1f] to-[#1a4a35] rounded-2xl sm:rounded-3xl border-2 border-lime-400/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400 text-[#0f2a1f] text-xs font-bold rounded-full">
                <Crown className="w-3 h-3" />
                Most Popular
              </span>
            </div>
            <p className="text-sm font-medium text-lime-400/80 mb-2">Premium</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-white">${billing === 'monthly' ? '8' : '79'}</span>
              <span className="text-white/50 text-sm">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            {billing === 'yearly' ? (
              <p className="text-sm text-white/40 mb-6">That's ~$6.58/month, billed annually</p>
            ) : (
              <p className="text-sm text-white/40 mb-6">Billed monthly, cancel anytime</p>
            )}
            <a href="/auth/signin?callbackUrl=/premium" className="block w-full py-3 text-center text-sm font-semibold text-[#0f2a1f] bg-lime-400 rounded-xl hover:bg-lime-300 transition-colors mb-6">
              Upgrade to Premium
            </a>
            <ul className="space-y-3">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-lime-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// FAQ
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does Stride know when I will lose focus?',
      answer: 'Stride checks in during your sessions and asks how you feel. Over time, it spots patterns like when you usually drift, what causes it, and what helps. Then it uses that to nudge you before it happens.',
    },
    {
      question: 'What kind of nudges does Stride send?',
      answer: 'Short, calm messages. Sometimes a quick breathing exercise. Sometimes a stretch. Sometimes just a check-in. The more you use it, the more personalized they get.',
    },
    {
      question: 'Is Stride free?',
      answer: 'Stride has a free plan with 3 sessions per day (up to 30 minutes each). For unlimited sessions, longer durations, smarter AI, and your full Focus Fingerprint, you can upgrade to Premium for $8/month or $79/year.',
    },
    {
      question: 'Does it work on mobile?',
      answer: 'Yes. On iPhone, add Stride to your home screen from Safari for the best experience, including push notifications when you leave the app.',
    },
    {
      question: 'Is my data private?',
      answer: 'Yes. Your focus data stays yours. We do not sell it or share it with anyone. See our Privacy Policy for details.',
    },
    {
      question: 'Can I cancel my Premium subscription?',
      answer: 'Yes, cancel anytime. Your premium features stay active until the end of your billing period. No questions asked.',
    },
  ];

  return (
    <section id="faq" ref={ref} className="py-16 sm:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer} className="grid md:grid-cols-2 gap-8 sm:gap-12">
          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-600 mb-8">Here are answers to the common ones. Still curious? Reach out.</p>
            <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-100">
              <MessageSquare className="w-8 h-8 text-[#1a3a2f] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Got More Questions?</h3>
              <p className="text-sm text-gray-600 mb-4">We are happy to help.</p>
              <a href="mailto:hello@trystrideai.com" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[#1a3a2f] bg-lime-100 rounded-full hover:bg-lime-200 transition-colors">
                Contact us
              </a>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900 pr-4 text-sm">{faq.question}</span>
                  <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-90' : ''}`} />
                </button>
                {openIndex === index && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
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

// CTA
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={fadeInUp} className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0f2a1f] via-[#143527] to-[#1a4a35] p-6 sm:p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.15)_0%,_transparent_60%)]" />
          <div className="relative z-10 text-center md:text-left md:grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">Ready to Focus Better?</h2>
              <p className="text-white/60 mb-6">Start your first session in under 30 seconds. Free to get started.</p>
              <a href="/auth/signin" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="hidden md:block">
              <div className="bg-[#0f2a1f] rounded-2xl border border-white/10 p-6 transform rotate-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-white/50">Focus Score</span>
                  <span className="text-xs text-lime-400">This week</span>
                </div>
                <p className="text-3xl font-bold text-white mb-4">8.2<span className="text-lg text-white/50">/10</span></p>
                <div className="h-24 flex items-end gap-1">
                  {[30, 45, 35, 55, 50, 70, 65].map((h, i) => (
                    <div key={i} className="flex-1 bg-lime-400/60 rounded-t" style={{ height: `${h}%` }} />
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
    <footer className="py-12 sm:py-16 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 mb-8 sm:mb-12">
          <a href="#">
            <Image src="/icons/stride-dark.png" alt="Stride" width={120} height={36} className="h-9 w-auto" />
          </a>
          <div className="flex flex-wrap gap-6 sm:gap-8">
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">FAQ</a>
            <a href="mailto:hello@trystrideai.com" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">&copy; 2026 Stride. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-900 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main
export default function StrideLandingPage() {
  return (
    <main className="bg-white text-gray-900 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <BentoFeatures />
      <FeatureSections />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}