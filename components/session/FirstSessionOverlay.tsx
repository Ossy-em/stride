'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, Trophy } from 'lucide-react';

interface FirstSessionOverlayProps {
  onDismiss: () => void;
}

export default function FirstSessionOverlay({ onDismiss }: FirstSessionOverlayProps) {
  const [countdown, setCountdown] = useState(5);
  const [canDismiss, setCanDismiss] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanDismiss(true);
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleDismiss = () => {
    if (!canDismiss) return;
    setDismissing(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        dismissing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0a1f16]/80 backdrop-blur-md" />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-[#0f2a1f] border border-lime-400/20 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-lime-400/60 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-lime-400/10 blur-xl" />

        <div className="px-7 pt-8 pb-7">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-lime-400/20 rounded-2xl blur-md" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-lime-400/30 to-lime-500/20 border border-lime-400/30 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-lime-400" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold text-white text-center mb-1 tracking-tight">
            Welcome to Stride
          </h2>
          <p className="text-sm text-lime-400/70 text-center mb-6 font-medium">
            Here's how it works
          </p>

          {/* Feature list */}
          <div className="space-y-3 mb-7">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-lime-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-lime-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI watches your focus</p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                  Stride predicts when you're about to drift and nudges you back before it happens.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Respond to check-ins</p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                  When Stride nudges you, a quick tap helps it learn your patterns faster.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-xl bg-lime-400/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Trophy className="w-4 h-4 text-lime-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Earn your focus score</p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                  At the end of every session, you'll see how well you stayed in the zone.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleDismiss}
            disabled={!canDismiss}
            className={`w-full py-3.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              canDismiss
                ? 'bg-lime-400 text-[#0f2a1f] hover:bg-lime-300 cursor-pointer shadow-lg shadow-lime-400/20'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {canDismiss ? "Got it, let's lock in 🔒" : `Starting in ${countdown}...`}
          </button>
        </div>
      </div>
    </div>
  );
}