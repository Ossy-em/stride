'use client';

import { signIn } from 'next-auth/react';
import { Chrome } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden px-6">
      {/* contained centre bloom — same as the landing hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: 'blur(80px)',
          background:
            'radial-gradient(22% 26% at 50% 44%, rgba(16,34,28,0.30) 0%, transparent 72%), radial-gradient(34% 40% at 50% 48%, rgba(47,86,72,0.26) 0%, transparent 76%), radial-gradient(48% 54% at 50% 50%, rgba(72,100,91,0.20) 0%, transparent 80%)',
        }}
      />

     

      <Card tone="raised" pad="lg" bordered className="relative z-10 w-full max-w-md text-center">
        <h1 className="text-[26px] font-bold tracking-tight text-[#10221c] mb-2">
          Welcome back
        </h1>
        <p className="text-[15px] text-[#48645b] mb-8">
          Sign in to pick up where your focus left off.
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="group relative w-full flex items-center justify-center gap-3 overflow-hidden bg-[#10221c] text-[#f0f0ec] font-medium py-3.5 px-6 rounded-full cursor-pointer transition-transform active:translate-y-px"
        >
          <Chrome className="w-[18px] h-[18px] relative z-10" />
          <span className="relative z-10">Continue with Google</span>
        </button>

        <p className="text-xs text-[#7c9389] mt-6 leading-relaxed">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-[#48645b] underline underline-offset-2 hover:text-[#10221c] transition-colors">
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-[#48645b] underline underline-offset-2 hover:text-[#10221c] transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </Card>
    </div>
  );
}