'use client';

/** The landing page itself. app/page.tsx wraps it with metadata and structured data. */

import HeroSection from './hero-section';
import BentoFeatures from './bento-features';
import FeatureSections from './feature-sections';
import FeatureShowcase from './feature-showcase';
import TestimonialsSection from './testimonials-section';
import PricingSection from './pricing-section';
import FAQSection from './faq-section';
import CTASection from './cta-section';
import Footer from './footer';

export default function Landing() {
  return (
   <main className="landing overflow-x-clip">
      <HeroSection />
      <BentoFeatures />
      <FeatureSections />
      <FeatureShowcase />  
      <TestimonialsSection />
      {/* <PricingSection /> */}
      <FAQSection />
      <div className="l-divider-wrap"><hr className="l-divider" /></div>
      <CTASection />
      <div className="l-divider-wrap"><hr className="l-divider" /></div>
      <Footer />
    </main>
  );
}