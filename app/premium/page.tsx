'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  ArrowLeft,
  Check,
  X,
  Crown,
  Shield,
  Sparkles,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

export default function PremiumPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/plan')
        .then(res => res.json())
        .then(data => {
          setCurrentPlan(data.plan || 'free');
          if (data.portalUrl) setPortalUrl(data.portalUrl);
        })
        .catch(() => {});
    }
  }, [status]);

  const handleUpgrade = async () => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: billing }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const monthlyPrice = 8;
  const yearlyPrice = 79;
  const currentPrice = billing === 'monthly' ? monthlyPrice : yearlyPrice;
  const savings = billing === 'yearly' ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100) : 0;

  const isPremium = currentPlan === 'premium';

  const comparisonRows = [
    { feature: 'Sessions per day', free: '3', premium: 'Unlimited' },
    { feature: 'Session length', free: '30 min', premium: 'Up to 3 hours' },
    { feature: 'AI nudges', free: 'Basic', premium: 'Advanced' },
    { feature: 'Focus Fingerprint', free: 'Growth stats', premium: 'Full insights' },
    { feature: 'Pause & resume', free: false, premium: true },
    { feature: 'Session history', free: '7 days', premium: 'Unlimited' },
    // { feature: 'Data export', free: false, premium: true },
  ];

  const faqs = [
    {
      q: 'Can I cancel anytime?',
      a: 'Yes. You can cancel from your subscription management page anytime. Premium features stay active until the end of your billing period.',
    },
    {
      q: 'What happens to my data if I downgrade?',
      a: "Your data is never deleted. You'll keep access to recent sessions, but full history and advanced insights will be locked until you upgrade again.",
    },
    {
      q: 'Is there a free trial?',
      a: "The free plan is your trial. Use it as long as you want. Upgrade when you're ready for more.",
    },
    {
      q: 'What payment methods do you accept?',
      a: 'All major credit and debit cards through our secure payment partner.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#1a3a2f]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-gray-900">Stride</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-4">
            <Crown className="w-3.5 h-3.5" />
            Premium
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Focus without limits
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Smarter AI, deeper insights, no restrictions.
          </p>
        </div>

        {/* Already premium */}
        {isPremium && (
          <div className="mb-10 p-5 bg-lime-50 border border-lime-200 rounded-xl text-center space-y-3">
            <p className="text-sm font-medium text-lime-800">
              You're on the Premium plan. Thank you for supporting Stride!
            </p>
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-lime-700 hover:text-lime-900 font-medium"
              >
                Manage subscription
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Pricing + Upgrade */}
        {!isPremium && (
          <div className="mb-12">
            {/* Billing toggle */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-full">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    billing === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                    billing === 'yearly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Yearly
                  {billing === 'yearly' && (
                    <span className="text-xs text-lime-600 font-semibold">Save {savings}%</span>
                  )}
                </button>
              </div>
            </div>

            {/* Price card */}
            <div className="max-w-sm mx-auto">
              <div className="bg-gradient-to-br from-[#0f2a1f] to-[#1a4a35] rounded-2xl p-6 sm:p-8 text-center">
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white">${currentPrice}</span>
                  <span className="text-white/50 text-sm">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                {billing === 'yearly' && (
                  <p className="text-white/40 text-xs mb-6">
                    $6.58/month billed annually
                  </p>
                )}
                {billing === 'monthly' && <div className="mb-6" />}
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3.5 bg-lime-400 text-[#0f2a1f] font-semibold rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Upgrade Now'}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Shield className="w-3.5 h-3.5 text-white/40" />
                  <p className="text-xs text-white/40">Cancel anytime. No questions asked.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature comparison table */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
            Free vs Premium
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">
                    Feature
                  </th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-3 w-24 sm:w-32">
                    Free
                  </th>
                  <th className="text-center text-xs font-medium text-lime-700 uppercase tracking-wider px-3 py-3 w-24 sm:w-32 bg-lime-50/50">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className={i < comparisonRows.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="text-sm text-gray-700 px-4 sm:px-5 py-3">
                      {row.feature}
                    </td>
                    <td className="text-center px-3 py-3">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-4 h-4 text-gray-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-gray-500">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-3 bg-lime-50/30">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <Check className="w-4 h-4 text-lime-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-lime-700">{row.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ - accordion style like landing page */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">
            Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-5 pb-4">
                    <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        {!isPremium && (
          <div className="text-center pb-8">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-lime-400 text-[#0f2a1f] font-semibold rounded-full hover:bg-lime-300 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Setting up...' : 'Upgrade to Premium'}
            </button>
            <p className="text-xs text-gray-400 mt-3">
              ${billing === 'monthly' ? `${monthlyPrice}/month` : `${yearlyPrice}/year`} · Cancel anytime
            </p>
          </div>
        )}

        {/* Manage subscription link for premium users at bottom too */}
        {isPremium && portalUrl && (
          <div className="text-center pb-8">
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Manage or cancel subscription
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </main>
    </div>
  );
}