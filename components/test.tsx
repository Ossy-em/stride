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
  ChevronRight,
  Sparkles,
  Target,
  Bell,
  Activity,
  CheckCircle2,
  Play,
  TrendingUp,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1]as const  } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
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
    { name: 'Pricing', href: '#pricing' },
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
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors"
            >
              Get Started
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
              href="/signup"
              className="block mt-4 w-full py-2.5 text-center text-[#1a3a2f] font-medium bg-lime-400 rounded-full"
            >
              Get Started
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
              <Image
                src="/assets/avatars/avatar-4.png"
                alt="User"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-[#143527] object-cover"
              />
            </div>
            <span className="text-sm text-white/80">2k+ users staying focused</span>
            <a href="#testimonials" className="text-sm text-lime-400 hover:text-lime-300 flex items-center gap-1">
              Join them <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
          >
            Your Focus Just
            <br />
            <span className="text-lime-400">Activated Autopilot</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/60 max-w-2xl mx-auto mb-8"
          >
            Spend less time fighting distractions, more time in deep work. We predict when you will lose focus and intervene with AI-powered precision.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors"
            >
              Start Free Trial
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
            >
              Learn more
            </a>
          </motion.div>
        </div>

        {/* Hero Visual - Phone Mockups with Floating UI */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative mt-16"
        >
          <div className="relative max-w-5xl mx-auto">
            {/* Floating UI Cards - Left Side */}
            <div className="absolute left-0 top-1/4 -translate-x-1/4 z-20 hidden lg:block">
              <Image
                src="/assets/hero-float-analytics.png"
                alt="Focus Sessions Analytics"
                width={200}
                height={150}
                className="w-48 transform -rotate-6"
              />
            </div>

            {/* Floating UI Cards - Right Side */}
            <div className="absolute right-0 top-1/3 translate-x-1/4 z-20 hidden lg:block">
              <Image
                src="/assets/hero-float-stats.png"
                alt="Deep Work Score"
                width={180}
                height={140}
                className="w-44 transform rotate-6"
              />
            </div>

            {/* Central Phone Mockups */}
            <div className="flex justify-center items-end gap-4">
              {/* Left Phone */}
              <div className="w-40 sm:w-52 transform -rotate-6 translate-y-8 opacity-80">
                <Image
                  src="/assets/hero-phone-left.png"
                  alt="Focus lifestyle content"
                  width={250}
                  height={530}
                  className="w-full rounded-3xl"
                />
              </div>

              {/* Center Phone */}
              <div className="w-52 sm:w-72 z-10">
                <Image
                  src="/assets/hero-phone.png"
                  alt="Stride App"
                  width={300}
                  height={600}
                  className="w-full"
                  priority
                />
              </div>

              {/* Right Phone */}
              <div className="w-40 sm:w-52 transform rotate-6 translate-y-8 opacity-80">
                <Image
                  src="/assets/hero-phone-right.png"
                  alt="Productivity lifestyle content"
                  width={250}
                  height={530}
                  className="w-full rounded-3xl"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Logo Bar Section
function LogoBar() {
  const companies = [
    { name: 'Flowstate', logo: '/assets/logos/flowstate.svg' },
    { name: 'DeepMind Labs', logo: '/assets/logos/deepmind-labs.svg' },
    { name: 'Zenith', logo: '/assets/logos/zenith.svg' },
    { name: 'Focusly', logo: '/assets/logos/focusly.svg' },
    { name: 'Chronos', logo: '/assets/logos/chronos.svg' },
  ];

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
          {companies.map((company) => (
            <Image
              key={company.name}
              src={company.logo}
              alt={company.name}
              width={120}
              height={40}
              className="h-8 w-auto grayscale"
            />
          ))}
        </div>
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
              Your Focus Just
              <br />
              <span className="text-[#1a3a2f]">Activated Autopilot</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeInUp} className="flex flex-col justify-center">
            <p className="text-gray-600 mb-4">
              Spend less time fighting distractions, more time improving your deep work capacity.
            </p>
            <div className="flex gap-3">
              <a
                href="/signup"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics that matter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Track your focus sessions and optimize them with AI-powered insights.
            </p>
            <div className="h-40 bg-white rounded-2xl border border-gray-100 flex items-end justify-around p-4">
              {[45, 65, 50, 85, 70, 90, 60].map((h, i) => (
                <div key={i} className="relative">
                  <div
                    className={`w-6 rounded-t transition-all ${i === 5 ? 'bg-lime-500' : 'bg-lime-400/60'}`}
                    style={{ height: `${h}%` }}
                  />
                  {i === 5 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-lime-500 rounded text-[10px] text-white font-medium whitespace-nowrap">
                      87% accuracy
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2: Integrations */}
          <motion.div
            variants={fadeInUp}
            className="p-6 bg-gray-50 rounded-3xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seamless Integrations</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connects with all your productivity tools.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {['N', 'S', 'C', 'Sp', 'T', 'L'].map((icon, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-400"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Precise Predictions</h3>
            <p className="text-sm text-gray-600 mb-4">
              AI predicts when you will lose focus before it happens.
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

          {/* Card 4: Media/Content - Large */}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">One tool fits all</h3>
            <p className="text-sm text-gray-600 mb-4">
              No more endless add-ons, plugins and extensions.
            </p>
            <div className="h-36 bg-white rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/features/growth-plant.png"
                alt="Growth illustration"
                width={200}
                height={160}
                className="w-auto h-32 object-contain"
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
      badge: 'Predictive AI',
      title: 'Know When Focus Breaks Before It Happens',
      description:
        'Our AI learns your unique patterns and predicts distraction moments with 87% accuracy. Get timely interventions, not annoying interruptions.',
      benefits: ['Pattern Learning', 'Smart Timing', 'Zero Disruption'],
      imagePosition: 'right',
      image: '/assets/features/feature-ai-prediction.png',
    },
    {
      badge: 'Smart Interventions',
      title: 'Personalized Nudges That Actually Work',
      description:
        'From 2-minute breathing exercises to movement prompts and mindful micro-breaks. Each intervention is tailored to what works best for you.',
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
          {features.map((feature, index) => (
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
      role: 'Software Engineer at Stripe',
      quote:
        'Stride knows when I need a break before I do. My deep work sessions have doubled since I started using it.',
      category: 'Engineering Excellence',
      image: '/assets/testimonials/sarah-chen.jpg',
    },
    {
      name: 'Marcus Johnson',
      role: 'Content Creator',
      quote:
        "As a writer, focus is everything. Stride's gentle interventions help me stay in the zone for hours.",
      category: 'Creative Flow',
      image: '/assets/testimonials/marcus-johnson.jpg',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Product Manager at Notion',
      quote:
        'The analytics helped me understand my focus patterns. I now structure my entire day around my natural energy cycles.',
      category: 'Data-Driven Productivity',
      image: '/assets/testimonials/elena-rodriguez.jpg',
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
            Trusted by Focused Minds
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how professionals across industries are transforming their productivity with Stride.
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
              {/* Image */}
              <div className="aspect-[3/4] relative">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
                {/* Name Badge */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-[#1a3a2f] rounded-xl px-4 py-3">
                    <p className="text-white font-medium text-sm">{testimonial.name}</p>
                    <p className="text-white/60 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
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
            href="/signup"
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
      question: 'How does Stride predict when I will lose focus?',
      answer:
        'Stride uses machine learning models trained on productivity research combined with your personal session data. It identifies patterns in timing, breaks, and work rhythms to predict distraction moments before they occur.',
    },
    {
      question: 'What kind of interventions does Stride provide?',
      answer:
        'Interventions range from 2-minute guided breathing exercises to movement prompts, hydration reminders, and strategic micro-breaks. You can customize which types work best for you.',
    },
    {
      question: 'Is my data private and secure?',
      answer:
        'Absolutely. All focus data is processed locally on your device by default. Cloud sync is optional and uses end-to-end encryption.',
    },
    {
      question: 'Can I customize the intervention timing?',
      answer:
        'Yes! You can set preferences for intervention frequency, types, and even block certain hours for uninterrupted deep work.',
    },
    {
      question: 'Does Stride work with my existing tools?',
      answer:
        'Stride integrates with Notion, Todoist, Calendar apps, Slack, and more. Check our integrations page for the full list.',
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
              Frequently Asked
              <br />
              Questions
            </h2>
            <p className="text-gray-600 mb-8">
              Find answers to common questions about Stride, focus interventions, and how to optimize your deep work.
            </p>

            {/* Contact Card */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <MessageSquare className="w-8 h-8 text-[#1a3a2f] mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Got More Questions?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our team is here to help with anything about focus, productivity, and getting started.
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
              {/* Mini avatar row */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex -space-x-2">
                  <Image
                    src="/assets/avatars/avatar-1.png"
                    alt="User"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-[#143527] object-cover"
                  />
                  <Image
                    src="/assets/avatars/avatar-2.png"
                    alt="User"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-[#143527] object-cover"
                  />
                  <Image
                    src="/assets/avatars/avatar-3.png"
                    alt="User"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-[#143527] object-cover"
                  />
                </div>
                <span className="text-sm text-white/60">Join 2k+ focused professionals</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Don't Wait.
                <br />
                Get Results From Day One.
              </h2>
              <p className="text-white/60 mb-6">
                Start your free trial today and experience the power of predictive focus interventions.
              </p>
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors"
              >
                Join the waitlist
              </a>
            </div>

            {/* Dashboard Preview */}
            <div>
              <div className="bg-[#0f2a1f] rounded-2xl border border-white/10 p-6 transform rotate-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-white/50">Total Focus Hours</span>
                  <span className="text-xs text-lime-400">+23% this month</span>
                </div>
                <p className="text-3xl font-bold text-white mb-4">2,847 hrs</p>
                <div className="h-24 flex items-end gap-1">
                  {[30, 45, 35, 55, 50, 70, 65, 85, 75, 90, 80, 95].map((h, i) => (
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
        {/* Newsletter + Logo Row */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Deep Work Demands Big Focus.
              <br />
              Join Our Newsletter.
            </h3>
            <div className="flex gap-2 mt-4">
              <input
                type="email"
                placeholder="name@email.com"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-lime-400"
              />
              <button className="px-5 py-2.5 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-start md:justify-end">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#1a3a2f]" strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold text-gray-900">Stride</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-gray-100">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Pages</h4>
            <ul className="space-y-2">
              {['Home', 'Features', 'Pricing', 'Blog'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Documentation', 'Integrations', 'Updates', 'Support'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                hello@stride.app
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Location</h4>
            <p className="text-sm text-gray-500">
              San Francisco, CA
              <br />
              United States
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {['youtube', 'twitter', 'pinterest', 'instagram'].map((social) => (
              <a
                key={social}
                href="#"
                className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <span className="text-xs">{social[0].toUpperCase()}</span>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Terms & Conditions
            </a>
            <span>Made with Stride</span>
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
      <LogoBar />
      <BentoFeatures />
      <FeatureSections />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}