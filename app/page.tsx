'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Brain,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Target,
  Bell,
  Activity,
  CheckCircle2,
  Play,
  TrendingUp,
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
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } },
};

// Color: Using emerald-700 (#047857) as primary
// Clean, single green without gradients

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
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white border-b border-stone-200' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-stone-900">Stride</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="/login"
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-stone-600"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden bg-white"
        >
          <div className="py-4 space-y-1 border-t border-stone-100">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-2 py-2.5 text-stone-600 hover:text-stone-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <a
                href="/login"
                className="block w-full py-2.5 text-center text-stone-600 border border-stone-200 rounded-lg"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="block w-full py-2.5 text-center text-white font-medium bg-teal-700 rounded-lg"
              >
                Get Started
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}

// Hero Section
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-16 bg-stone-50">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <motion.div style={{ opacity }} className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="text-xs text-emerald-800 font-medium uppercase tracking-wide">AI-Powered Focus</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-stone-900">
              Stay focused
              <br />
              <span className="text-teal-700">before you drift</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={fadeInUp} className="mt-6 text-lg text-stone-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Stride predicts when you are about to lose focus and intervenes before distractions take over. Work smarter with AI that understands your rhythm.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="/auth/signin"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-teal-700 rounded-lg hover:bg-emerald-800 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <Play className="w-4 h-4" />
                See How It Works
              </a>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div variants={fadeInUp} className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-stone-50 bg-stone-300"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-stone-900">2,000+ users</p>
                <p className="text-xs text-stone-500">staying focused daily</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/assets/hero-phone.png"
                  alt="Stride App Interface"
                  width={380}
                  height={760}
                  className="relative z-10"
                  priority
                />
              </motion.div>

              {/* Floating Cards - minimal style */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -left-4 top-1/4 p-3 bg-white rounded-xl border border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Focus Predicted</p>
                    <p className="text-xs text-stone-500">12 min remaining</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -right-2 bottom-1/3 p-3 bg-white rounded-xl border border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Focus Score</p>
                    <p className="text-xs text-teal-700 font-medium">+23% this week</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-1.5 text-stone-400"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    {
      icon: Brain,
      title: 'Predictive Focus AI',
      description:
        'Our AI learns your focus patterns and predicts when distraction is imminent, intervening at the perfect moment.',
    },
    {
      icon: Bell,
      title: 'Smart Interventions',
      description:
        'Personalized nudges tailored to your work style. From gentle reminders to guided breathing exercises.',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description:
        'Comprehensive insights into your focus sessions. Track progress, identify patterns, and optimize your workflow.',
    },
    {
      icon: Target,
      title: 'Session Goals',
      description:
        'Set clear objectives for each focus session. Stride helps you stay accountable and measure achievement.',
    },
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description:
        'Continuous assessment of your focus state without being intrusive. Works silently in the background.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description:
        'Your data stays yours. All processing happens locally with enterprise-grade encryption for cloud features.',
    },
  ];

  return (
    <section id="features" ref={ref} className="relative py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.p variants={fadeInUp} className="text-teal-700 font-medium text-sm uppercase tracking-wide mb-3">
            Features
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Everything you need to master focus
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-stone-600">
            Stride combines cutting-edge AI with proven productivity techniques to help you achieve deep work consistently.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group p-6 rounded-2xl border border-stone-200 hover:border-emerald-200 bg-white hover:bg-emerald-50/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                <feature.icon className="w-5 h-5 text-teal-700" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-stone-900 mb-2">{feature.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      number: '01',
      title: 'Start a Focus Session',
      description:
        'Open Stride and begin your work session. Set your goals and let the AI calibrate to your current state.',
    },
    {
      number: '02',
      title: 'AI Monitors Your Patterns',
      description:
        'Our predictive engine analyzes micro-behaviors to understand when your focus is about to break.',
    },
    {
      number: '03',
      title: 'Timely Interventions',
      description:
        'Before distraction hits, Stride delivers personalized interventions: breathing exercises, movement prompts, or mindful breaks.',
    },
    {
      number: '04',
      title: 'Track and Improve',
      description:
        'Review your focus analytics, identify patterns, and watch your deep work capacity grow over time.',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.p variants={fadeInUp} className="text-teal-700 font-medium text-sm uppercase tracking-wide mb-3">
            How It Works
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-stone-900">
            Your path to unbreakable focus
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="relative p-6 bg-white rounded-2xl border border-stone-200"
            >
              <div className="flex gap-4">
                <span className="text-4xl font-bold text-emerald-100">{step.number}</span>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { value: '43%', label: 'Average focus improvement' },
    { value: '2.5h', label: 'Extra deep work daily' },
    { value: '89%', label: 'User satisfaction rate' },
    { value: '12min', label: 'Faster to enter flow state' },
  ];

  return (
    <section ref={ref} className="relative py-20 bg-teal-700">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-emerald-100 text-sm">{stat.label}</p>
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
      quote:
        'Stride has completely transformed how I work. The predictive interventions feel almost magical - it knows when I need a break before I do.',
      author: 'Sarah Chen',
      role: 'Software Engineer',
    },
    {
      quote:
        "As a writer, maintaining focus is everything. Stride's gentle nudges help me stay in the zone for hours. My output has nearly doubled.",
      author: 'Marcus Williams',
      role: 'Content Creator',
    },
    {
      quote:
        "The analytics alone are worth it. I finally understand my focus patterns and can structure my day around my natural energy cycles.",
      author: 'Elena Rodriguez',
      role: 'Product Manager',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.p variants={fadeInUp} className="text-teal-700 font-medium text-sm uppercase tracking-wide mb-3">
            Testimonials
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-stone-900">
            Loved by focused minds
          </motion.h2>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              variants={fadeInUp}
              className="p-6 rounded-2xl border border-stone-200 bg-stone-50"
            >
              <p className="text-stone-700 leading-relaxed mb-6 text-sm">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-300" />
                <div>
                  <p className="font-medium text-stone-900 text-sm">{testimonial.author}</p>
                  <p className="text-xs text-stone-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '3 focus sessions per day',
        'Basic interventions',
        'Weekly focus summary',
        'Mobile app access',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month',
      description: 'For serious productivity seekers',
      features: [
        'Unlimited focus sessions',
        'AI-powered predictive interventions',
        'Advanced analytics dashboard',
        'Custom intervention preferences',
        'Desktop and mobile apps',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Team',
      price: '$29',
      period: '/user/month',
      description: 'For teams that ship',
      features: [
        'Everything in Pro',
        'Team analytics and insights',
        'Admin dashboard',
        'SSO integration',
        'Dedicated account manager',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" ref={ref} className="relative py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.p variants={fadeInUp} className="text-teal-700 font-medium text-sm uppercase tracking-wide mb-3">
            Pricing
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Simple, transparent pricing
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-stone-600">
            Start free and upgrade when you are ready for more.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              className={`relative p-6 rounded-2xl ${
                plan.highlighted
                  ? 'bg-teal-700 text-white'
                  : 'bg-white border border-stone-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-900 rounded-full">
                  <span className="text-[10px] font-medium text-emerald-100 uppercase tracking-wide">Most Popular</span>
                </div>
              )}

              <div className="mb-5">
                <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? 'text-white' : 'text-stone-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlighted ? 'text-emerald-100' : 'text-stone-500'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-5">
                <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-stone-900'}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={plan.highlighted ? 'text-emerald-100' : 'text-stone-500'}>
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? 'text-emerald-200' : 'text-emerald-600'
                    }`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-emerald-50' : 'text-stone-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="/signup"
                className={`block w-full py-2.5 text-center text-sm font-medium rounded-lg transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-teal-700 hover:bg-emerald-50'
                    : 'border border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does Stride predict when I will lose focus?',
      answer:
        'Stride uses a combination of session timing patterns, historical data from your past sessions, and AI models trained on productivity research. It learns your unique focus rhythms and identifies the subtle signs that precede distraction.',
    },
    {
      question: 'What kind of interventions does Stride provide?',
      answer:
        'Interventions range from gentle visual reminders to guided breathing exercises, movement prompts, mindfulness moments, and strategic break suggestions. You can customize which types of interventions you prefer and when they appear.',
    },
    {
      question: 'Is my data private and secure?',
      answer:
        'Absolutely. All focus session data is processed locally on your device by default. If you opt into cloud features for cross-device sync, your data is encrypted end-to-end with keys only you control.',
    },
    {
      question: 'Can I use Stride with my existing productivity tools?',
      answer:
        'Yes! Stride integrates with popular tools like Notion, Todoist, Linear, and calendar apps. The Pro plan includes API access for custom integrations.',
    },
    {
      question: 'What if Stride interrupts me during actual deep work?',
      answer:
        'The AI learns from every interaction. If you dismiss an intervention because you are in flow, Stride notes this and adjusts its predictions. Most users report the AI becomes highly accurate within the first week.',
    },
  ];

  return (
    <section id="faq" ref={ref} className="relative py-24 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.p variants={fadeInUp} className="text-teal-700 font-medium text-sm uppercase tracking-wide mb-3">
            FAQ
          </motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-stone-900">
            Questions? Answers.
          </motion.h2>
        </motion.div>

        {/* FAQ Items */}
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer} className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="border border-stone-200 rounded-xl overflow-hidden bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors"
              >
                <span className="font-medium text-stone-900 pr-4 text-sm">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={openIndex === index ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-stone-600 text-sm leading-relaxed">{faq.answer}</p>
              </motion.div>
            </motion.div>
          ))}
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
    <section ref={ref} className="relative py-24 bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={staggerContainer}>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Ready to unlock your deepest focus?
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-stone-600 mb-8 max-w-xl mx-auto">
            Join thousands of developers, writers, and creators who have transformed their productivity with Stride.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <a
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-teal-700 rounded-lg hover:bg-emerald-800 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>

          <motion.p variants={fadeInUp} className="mt-4 text-sm text-stone-500">
            No credit card required. 14-day free trial.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Resources: ['Documentation', 'Help Center', 'Community', 'Contact'],
    Legal: ['Privacy', 'Terms', 'Security'],
  };

  return (
    <footer className="relative py-12 border-t border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-stone-900">Stride</span>
            </a>
            <p className="text-stone-500 text-sm">Your AI-powered focus companion.</p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-stone-900 font-medium text-sm mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-stone-500 hover:text-teal-700 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">2025 Stride. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-stone-400 hover:text-teal-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-stone-400 hover:text-teal-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="#" className="text-stone-400 hover:text-teal-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
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
    <main className="bg-white text-stone-900 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}