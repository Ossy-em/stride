'use client';

import { useState } from 'react';
import { X, Zap, Clock, Brain, BarChart3, Pause, Download } from 'lucide-react';

interface UpgradePromptProps {
  reason: 'session_limit' | 'duration_limit' | 'pause' | 'self_discovery' | 'ai_insights' | 'history';
  onClose: () => void;
  context?: {
    sessionsUsed?: number;
    sessionLimit?: number;
    maxDuration?: number;
  };
}

const REASON_CONFIG = {
  session_limit: {
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    title: "You've hit today's session limit",
    description: "Free accounts get 3 sessions per day. Upgrade to focus as much as you need.",
  },
  duration_limit: {
    icon: <Clock className="w-6 h-6 text-amber-500" />,
    title: 'Need a longer session?',
    description: 'Free sessions max out at 30 minutes. Premium lets you go up to 3 hours.',
  },
  pause: {
    icon: <Pause className="w-6 h-6 text-amber-500" />,
    title: 'Pause & resume is a Premium feature',
    description: "Life happens. Premium lets you pause your session and pick up right where you left off.",
  },
  self_discovery: {
    icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
    title: 'Unlock your Focus Fingerprint',
    description: 'See exactly when you drift, your peak hours, best days, and how your focus is evolving over time.',
  },
  ai_insights: {
    icon: <Brain className="w-6 h-6 text-amber-500" />,
    title: 'Get smarter insights',
    description: 'Premium uses a more advanced AI to generate personalized interventions that feel more human and adapt to your patterns.',
  },
  history: {
    icon: <Download className="w-6 h-6 text-amber-500" />,
    title: 'Access your full history',
    description: "Free accounts see the last 7 days. Premium gives you your complete focus history and data export.",
  },
};

export default function UpgradePrompt({ reason, onClose, context }: UpgradePromptProps) {
  const config = REASON_CONFIG[reason];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0f2a1f] to-[#1a4a35] p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            {config.icon}
          </div>
          <h2 className="text-lg font-bold text-white">{config.title}</h2>
          <p className="text-sm text-white/60 mt-2">{config.description}</p>
        </div>

        {/* Premium benefits */}
        <div className="p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Premium includes
          </p>
          <div className="space-y-2.5">
            {[
              'Unlimited sessions',
              'Sessions up to 3 hours',
              'Smarter, personalized interventions',
              'Full Focus Fingerprint access',
              'Pause & resume sessions',
              'Complete session history',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                </div>
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              // TODO: Connect to payment provider (Stripe/Paystack)
              window.open('/premium', '_blank');
            }}
            className="w-full mt-6 py-3 bg-lime-400 text-[#0f2a1f] font-semibold rounded-xl hover:bg-lime-300 transition-colors"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={onClose}
            className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}