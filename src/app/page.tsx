'use client';

import HeroSection from '../components/hero-section';
import BentoFeatures from '../components/bento-features';
import FeatureSections from '../components/feature-sections';
import TestimonialsSection from '../components/testimonials-section';
import PricingSection from '../components/pricing-section';
import FAQSection from '../components/faq-section';
import CTASection from '../components/cta-section';
import Footer from '../components/footer';

export default function StrideLandingPage() {
  return (
   <main className="bg-white text-gray-900 overflow-x-clip">
      <HeroSection />
      <BentoFeatures />
      <FeatureSections />  
      <TestimonialsSection />
      {/* <PricingSection /> */}
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}