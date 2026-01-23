'use client';

import { signIn } from 'next-auth/react';
import { Chrome } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-amber-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Stride
          </h1>
          <p className="text-gray-600">
            Sign in to start tracking your focus sessions
          </p>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-teal-500 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
        >
          <Chrome className="w-5 h-5" />
          Sign in with Google
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}