'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wordmark } from '@/components/ui/Wordmark';
import {
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

  const monthlyPrice = 6;
  const yearlyPrice = 58;
  const currentPrice = billing === 'monthly' ? monthlyPrice : yearlyPrice;
  const savings = billing === 'yearly' ? 20 : 0;

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
    <div className="min-h-screen bg-[#f7faf8]">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-5 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#7c9389] hover:text-[#10221c] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <Wordmark size="md" />
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eef1ed] text-[#2f5648] rounded-full text-xs font-medium mb-4">
            <Crown className="w-3.5 h-3.5" />
            Premium
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#10221c] tracking-tight mb-3">
            Focus without limits
          </h1>
          <p className="text-[#7c9389] max-w-md mx-auto">
            Smarter AI, deeper insights, no restrictions.
          </p>
        </div>

        {/* Already premium */}
        {isPremium && (
          <div className="mb-10 p-5 bg-[#eef1ed] rounded-xl text-center space-y-3">
            <p className="text-sm font-medium text-[#10221c]">
              You're on the Premium plan. Thank you for supporting Stride!
            </p>
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#2f5648] hover:text-[#10221c] font-medium"
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
              <div className="flex items-center gap-1 p-1 bg-[#eef1ed] rounded-full">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    billing === 'monthly'
                      ? 'bg-white text-[#10221c] shadow-sm'
                      : 'text-[#7c9389] hover:text-[#10221c]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
                    billing === 'yearly'
                      ? 'bg-white text-[#10221c] shadow-sm'
                      : 'text-[#7c9389] hover:text-[#10221c]'
                  }`}
                >
                  Yearly
                  {billing === 'yearly' && (
                    <span className="text-xs text-[#2f5648] font-semibold">Save {savings}%</span>
                  )}
                </button>
              </div>
            </div>

            {/* Price card */}
            <div className="max-w-sm mx-auto">
              <div className="bg-[#10221c] rounded-2xl p-6 sm:p-8 text-center">
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold text-white">${currentPrice}</span>
                  <span className="text-[#8aa89c] text-sm">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                {billing === 'yearly' && (
                  <p className="text-[#6a8a7e] text-xs mb-6">
                    $4.83/month, billed annually
                  </p>
                )}
                {billing === 'monthly' && <div className="mb-6" />}
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#f0f0ec] text-[#10221c] font-medium rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Upgrade Now'}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Shield className="w-3.5 h-3.5 text-[#6a8a7e]" />
                  <p className="text-xs text-[#6a8a7e]">Cancel anytime. No questions asked.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature comparison table */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-[#10221c] tracking-tight mb-4 text-center">
            Free vs Premium
          </h2>
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#eef1ed]">
                  <th className="text-left text-xs font-medium text-[#7c9389] px-4 sm:px-5 py-3">
                    Feature
                  </th>
                  <th className="text-center text-xs font-medium text-[#7c9389] px-3 py-3 w-24 sm:w-32">
                    Free
                  </th>
                  <th className="text-center text-xs font-medium text-[#2f5648] px-3 py-3 w-24 sm:w-32 bg-[#f4f7f2]">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className={i < comparisonRows.length - 1 ? 'border-b border-[#eef1ed]' : ''}>
                    <td className="text-sm text-[#48645b] px-4 sm:px-5 py-3">
                      {row.feature}
                    </td>
                    <td className="text-center px-3 py-3">
                      {typeof row.free === 'boolean' ? (
                        row.free ? (
                          <Check className="w-4 h-4 text-[#7c9389] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#b4c5bd] mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-[#7c9389]">{row.free}</span>
                      )}
                    </td>
                    <td className="text-center px-3 py-3 bg-[#f4f7f2]">
                      {typeof row.premium === 'boolean' ? (
                        row.premium ? (
                          <Check className="w-4 h-4 text-[#10221c] mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-[#b4c5bd] mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-[#10221c]">{row.premium}</span>
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
          <h2 className="text-lg font-bold text-[#10221c] tracking-tight mb-4 text-center">
            Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-[#10221c]">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7c9389] transition-transform flex-shrink-0 ml-2 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 sm:px-5 pb-4">
                    <p className="text-sm text-[#48645b] leading-relaxed">{faq.a}</p>
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#10221c] text-[#f0f0ec] font-medium rounded-full hover:bg-[#1a3229] transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Setting up...' : 'Upgrade to Premium'}
            </button>
            <p className="text-xs text-[#7c9389] mt-3">
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
              className="inline-flex items-center gap-1.5 text-sm text-[#7c9389] hover:text-[#10221c] font-medium"
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