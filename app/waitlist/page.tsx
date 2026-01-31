'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowLeft, Check, Loader2, Sparkles, Bell, Brain, TrendingUp } from 'lucide-react';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setMessage(data.message || "You're on the list!");
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35]">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(132,204,22,0.1)_0%,_transparent_60%)]" />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl animate-pulse"
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#1a3a2f]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-white">Stride</span>
            </Link>
            
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {status === 'success' ? (
              // Success State
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lime-400/20 flex items-center justify-center">
                  <Check className="w-10 h-10 text-lime-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                  You're on the list!
                </h1>
                <p className="text-white/60 mb-8">
                  We'll let you know as soon as Stride is ready. In the meantime, follow us for updates and focus tips.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/"
                    className="px-6 py-3 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors"
                  >
                    Back to Home
                  </Link>
                  <a
                    href="https://twitter.com/stridehq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
                  >
                    Follow @stridehq
                  </a>
                </div>
              </div>
            ) : (
              // Form State
              <>
                {/* Badge */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                    <Sparkles className="w-4 h-4 text-lime-400" />
                    <span className="text-sm text-white/80">Coming Soon</span>
                  </div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
                  Join the Waitlist
                </h1>
                <p className="text-white/60 text-center mb-8">
                  Be the first to experience focus that actually works. We predict when you'll lose focus and intervene before it happens.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={status === 'loading'}
                      className="w-full px-5 py-4 text-base bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className="w-full px-6 py-4 text-base font-medium text-[#1a3a2f] bg-lime-400 rounded-2xl hover:bg-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <span>Join Waitlist</span>
                    )}
                  </button>
                  
                  {status === 'error' && (
                    <p className="text-red-300 text-sm text-center">{message}</p>
                  )}
                </form>

                {/* Social Proof */}
                <p className="text-white/40 text-sm text-center mt-6">
                  Join 2,000+ others waiting for launch
                </p>

                {/* Features Preview */}
                <div className="mt-12 pt-8 border-t border-white/10">
                  <p className="text-xs uppercase tracking-widest text-white/40 text-center mb-6">
                    What you'll get
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5">
                      <Brain className="w-6 h-6 text-lime-400 mb-2" />
                      <span className="text-sm text-white/80">AI Focus Prediction</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5">
                      <Bell className="w-6 h-6 text-lime-400 mb-2" />
                      <span className="text-sm text-white/80">Smart Interventions</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-4 rounded-xl bg-white/5">
                      <TrendingUp className="w-6 h-6 text-lime-400 mb-2" />
                      <span className="text-sm text-white/80">Focus Analytics</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6">
          <p className="text-center text-white/30 text-sm">
            © {new Date().getFullYear()} Stride. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}