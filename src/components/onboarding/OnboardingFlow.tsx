'use client';

import { useState } from 'react';
import { Zap, Brain, Bell, TrendingUp, Sparkles } from 'lucide-react';

interface OnboardingFlowProps {
  userName?: string;
  onComplete: () => void;
}

export default function OnboardingFlow({ userName, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const firstName = userName?.split(' ')[0] || 'there';

  const nextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        onComplete();
      }
      setIsAnimating(false);
    }, 200);
  };

  const steps = [
    {
      icon: <Zap className="w-8 h-8 text-lime-400" />,
      title: `Hey ${firstName}!`,
      subtitle: 'Welcome to Stride',
      description: "Stride is your AI focus companion. It learns how you work and helps you stay locked in by predicting when you're about to lose focus.",
      buttonText: "Tell me more",
    },
    {
      icon: <Brain className="w-8 h-8 text-lime-400" />,
      title: 'It predicts, not reacts',
      subtitle: 'How Stride works',
      description: "During a focus session, Stride sends a gentle check-in right before your focus typically drifts. The more you use it, the better it gets at knowing your rhythm.",
      buttonText: 'What else?',
    },
    {
      icon: <Bell className="w-8 h-8 text-lime-400" />,
      title: 'Stay in the zone',
      subtitle: 'Even when you leave the app',
      description: "Stride sends push notifications so it can reach you even when you're in another app or your screen is off. When prompted, allow notifications for the best experience.",
      buttonText: 'Got it',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-lime-400" />,
      title: 'Your Focus Fingerprint',
      subtitle: 'Unique to you',
      description: "After a few sessions, you'll unlock your Focus Fingerprint with personal insights about when you focus best, where you drift, and how you're improving.",
      buttonText: 'One more thing',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-lime-400" />,
      title: "You're all set",
      subtitle: "Let's get focused",
      description: "Start your first session and Stride will begin learning your patterns. Got feedback? Use the feedback button anytime to let us know what you think.",
      buttonText: "Start focusing →",
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(132,204,22,0.1)_0%,_transparent_60%)] pointer-events-none" />

      <div className={`relative z-10 w-full max-w-md transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-lime-400' : i < step ? 'w-4 bg-lime-400/50' : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 flex items-center justify-center">
            {currentStep.icon}
          </div>

          <div className="text-center">
            <p className="text-lime-400/80 text-sm font-medium mb-2">{currentStep.subtitle}</p>
            <h1 className="text-2xl font-bold text-white mb-4">{currentStep.title}</h1>
            <p className="text-white/70 leading-relaxed mb-8">{currentStep.description}</p>
          </div>

          <button
            onClick={nextStep}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-lime-400 text-[#0f2a1f] font-semibold rounded-xl hover:bg-lime-300 transition-colors"
          >
            {currentStep.buttonText}
          </button>

          {step < steps.length - 1 && (
            <button
              onClick={onComplete}
              className="w-full mt-3 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Skip intro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}