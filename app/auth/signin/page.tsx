'use client';

import { signIn } from 'next-auth/react';
import { Chrome, Zap } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-150 relative overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(132,204,22,0.1)_0%,_transparent_60%)]" />

      <div className="relative z-10 bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35] p-8 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full mx-4">

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-lime-400 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#1a3a2f]" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-semibold text-white">Stride</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-white/60">
            Sign in to continue your focus journey
          </p>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-full transition-all cursor-pointer shadow-lg hover:shadow-xl"
        >
          <Chrome className="w-5 h-5" />
          Sign in with Google
        </button>

        <p className="text-xs text-white/40 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>


        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          {/* <p className="text-sm text-white/50">
            Don't have an account?{' '}
            <span className="text-lime-400 hover:text-lime-300 cursor-pointer">
              Sign up with Google
            </span>
          </p> */}
        </div>
      </div>
    </div>
  );
}