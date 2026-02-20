'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const footerLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
  { name: 'Contact', href: 'mailto:hello@trystrideai.com' },
];

export default function Footer() {
  return (
    <footer className="py-14 sm:py-18 bg-white border-t border-gray-100/80">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 mb-10 sm:mb-12">
          <a href="#" className="group">
            <Image
              src="/icons/stride-dark.png"
              alt="Stride"
              width={120}
              height={36}
              className="h-9 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
          </a>
          <div className="flex flex-wrap gap-6 sm:gap-8">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[13px] text-gray-400 hover:text-gray-900 transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[13px] text-gray-400">&copy; 2026 Stride. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[13px] text-gray-400">
            <a href="/privacy" className="hover:text-gray-900 transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-gray-900 transition-colors duration-300">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}