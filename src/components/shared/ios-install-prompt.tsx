'use client';

import { useState, useEffect } from 'react';
import { Share, X, Plus } from 'lucide-react';

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    ('standalone' in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
}

const DISMISS_KEY = 'stride-ios-prompt-dismissed';

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari when not already installed
    if (!isIOS() || !isSafari() || isInStandaloneMode()) return;

    // Check if user already dismissed
    try {
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (dismissed) return;
    } catch {}

    // Small delay so it doesn't flash on load
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    } catch {}
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
        onClick={handleDismiss}
      />

      {/* Prompt card */}
      <div className="relative w-full max-w-sm pointer-events-auto mb-2 animate-slide-up">
        <div className="bg-[#1a2e24] border border-white/10 rounded-2xl p-5 shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">
              Install Stride
            </h3>
            <p className="text-sm text-white/50 mt-1">
              Add to your home screen to get focus notifications on mobile.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Share className="w-4 h-4 text-[#8aa89c]-400" />
              </div>
              <div>
                <p className="text-sm text-white/80">
                  Tap the <span className="font-medium text-white">Share</span> button in Safari
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#8aa89c]-400" />
              </div>
              <div>
                <p className="text-sm text-white/80">
                  Scroll down and tap <span className="font-medium text-white">Add to Home Screen</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-[#8aa89c]-400 text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="text-sm text-white/80">
                  Open Stride from your home screen and notifications will work
                </p>
              </div>
            </div>
          </div>

          {/* Arrow pointing down to Safari share button */}
          <div className="mt-4 flex justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/30 animate-bounce">
              <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <style jsx>{`
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}