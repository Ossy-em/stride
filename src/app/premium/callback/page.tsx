'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';

export default function PaymentCallbackPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'pending' | 'failed'>('verifying');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch('/api/lemonsqueezy/verify');
        const data = await res.json();

        if (data.verified) {
          setStatus('success');
        } else if (data.pending) {
          setStatus('pending');
          // Retry after 5 seconds
          setTimeout(async () => {
            const retry = await fetch('/api/lemonsqueezy/verify');
            const retryData = await retry.json();
            setStatus(retryData.verified ? 'success' : 'pending');
          }, 5000);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#1a3a2f]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gray-900">Stride</span>
        </div>

        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 text-lime-500 mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying payment...</h1>
            <p className="text-gray-500">Hold on, we're confirming your upgrade.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lime-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-lime-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Premium!</h1>
            <p className="text-gray-500 mb-8">
              You now have unlimited sessions, smarter AI, and your full Focus Fingerprint.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-lime-400 text-[#0f2a1f] font-semibold rounded-full hover:bg-lime-300 transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment received!</h1>
            <p className="text-gray-500 mb-8">
              Your upgrade is being processed. This usually takes a few seconds. You can head to your dashboard — it'll activate automatically.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-lime-400 text-[#0f2a1f] font-semibold rounded-full hover:bg-lime-300 transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-8">
              We couldn't verify your payment. If you were charged, please contact us and we'll sort it out.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/premium"
                className="inline-flex items-center justify-center px-6 py-3 bg-lime-400 text-[#0f2a1f] font-semibold rounded-full hover:bg-lime-300 transition-colors"
              >
                Try Again
              </Link>
              <a
                href="mailto:emosinachi@gmail.com"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Contact support
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}