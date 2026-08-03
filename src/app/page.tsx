'use client';

import HeroSection from '../components/HeroSection';
import BentoFeatures from '../components/BentoFeatures';
import FeatureSections from '../components/FeatureSections';
import TestimonialsSection from '../components/TestimonialsSection';
import PricingSection from '../components/PricingSection';
import FAQSection from '../components/FAQSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

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