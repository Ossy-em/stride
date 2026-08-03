'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Lock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { FocusFingerprintData } from '@/types';
import PeakHoursCard from '@/components/patterns/PeakHoursCard';
import DriftPatternCard from '@/components/patterns/DriftPatternCard';
import DiscoveriesCard from '@/components/patterns/DiscoveriesCard';
import GrowthCard from '@/components/patterns/GrowthCard';
import DayBreakdownCard from '@/components/patterns/DayBreakdownCard';
import UpgradePrompt from '@/components/shared/UpgradePrompt';
import { Spinner } from '@/components/ui/Spinner';

interface InsufficientDataResponse {
  insufficient_data: true;
  sessions_completed: number;
  sessions_needed: number;
}

// *** NEW: Teaser response type for free users ***
interface FreeUserTeaserResponse {
  plan: 'free';
  upgrade_required: true;
  teaser: {
    totalSessions: number;
    growth: FocusFingerprintData['growth'];
    dayBreakdown: FocusFingerprintData['dayBreakdown'];
    locked_features: string[];
  };
}

type PatternsResponse = FocusFingerprintData | InsufficientDataResponse | FreeUserTeaserResponse;

export default function PatternsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<FocusFingerprintData | null>(null);
  const [insufficientData, setInsufficientData] = useState<{
    completed: number;
    needed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  // *** NEW ***
  const [teaserData, setTeaserData] = useState<FreeUserTeaserResponse['teaser'] | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPatterns();
    }
  }, [status]);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patterns');
      const result: PatternsResponse = await res.json();

      if ('insufficient_data' in result) {
        setInsufficientData({
          completed: result.sessions_completed,
          needed: result.sessions_needed,
        });
      } else if ('upgrade_required' in result) {
        // *** NEW: Free user gets teaser ***
        setTeaserData(result.teaser);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center">
        <Spinner size="lg" label="Analyzing your patterns..." />
      </div>
    );
  }

  // Insufficient data state
  if (insufficientData) {
    return (
      <div className="min-h-screen bg-[#f7faf8]">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-5">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#7c9389] hover:text-[#10221c] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <main className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#eef1ed] flex items-center justify-center">
            <Lock className="w-9 h-9 text-[#7c9389]" />
          </div>
          <h1 className="text-2xl font-bold text-[#10221c] tracking-tight mb-3">
            Your Focus Fingerprint is Forming
          </h1>
          <p className="text-[#48645b] mb-8 max-w-md mx-auto">
            Complete {insufficientData.needed - insufficientData.completed} more focus sessions to
            unlock personalized insights about how you focus.
          </p>
          <div className="max-w-xs mx-auto mb-8">
            <div className="h-2.5 bg-[#dfe4e0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10221c] rounded-full transition-all"
                style={{ width: `${(insufficientData.completed / insufficientData.needed) * 100}%` }}
              />
            </div>
            <p className="text-sm text-[#7c9389] mt-2">
              {insufficientData.completed} of {insufficientData.needed} sessions
            </p>
          </div>
          <Link
            href="/session/start"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#10221c] text-[#f0f0ec] font-medium rounded-full hover:bg-[#1a3229] transition-colors"
          >
            Start a Focus Session
          </Link>
        </main>
      </div>
    );
  }

  // *** NEW: Free user teaser state ***
  if (teaserData) {
    const totalSessions = teaserData.dayBreakdown.reduce((sum, d) => sum + d.sessionCount, 0);

    return (
      <div className="min-h-screen bg-[#f7faf8]">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-5">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#7c9389] hover:text-[#10221c] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <main className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#10221c] tracking-tight mb-2">Your Focus Fingerprint</h1>
            <p className="text-[#7c9389]">
              Patterns and insights based on your focus sessions.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Growth card - visible to free users */}
            {teaserData.growth && (
              <div className="lg:col-span-2">
                <GrowthCard growth={teaserData.growth} totalSessions={totalSessions} />
              </div>
            )}

            {/* Day breakdown - visible to free users */}
            <DayBreakdownCard dayBreakdown={teaserData.dayBreakdown} />

            {/* Locked cards */}
            {teaserData.locked_features.map((feature, i) => (
              <div
                key={i}
                onClick={() => setShowUpgrade(true)}
                className="relative p-6 bg-white rounded-2xl cursor-pointer shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)] overflow-hidden"
              >
                {/* Blur overlay */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-[#eef1ed] flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-[#7c9389]" />
                  </div>
                  <p className="text-sm font-medium text-[#10221c]">{feature}</p>
                  <p className="text-xs text-[#2f5648] mt-1">Upgrade to unlock →</p>
                </div>
                {/* Fake content behind blur */}
                <div className="opacity-30">
                  <div className="h-4 bg-[#dfe4e0] rounded w-1/2 mb-3" />
                  <div className="h-3 bg-[#eef1ed] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#eef1ed] rounded w-2/3 mb-4" />
                  <div className="h-24 bg-[#eef1ed] rounded-xl" />
                </div>
              </div>
            ))}
          </div>

          {/* Upgrade CTA */}
          <div className="mt-8 p-6 bg-[#10221c] rounded-2xl text-center">
            <TrendingUp className="w-7 h-7 text-[#8aa89c] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white tracking-tight mb-2">Unlock your full Focus Fingerprint</h3>
            <p className="text-[#8aa89c] text-sm mb-4 max-w-md mx-auto">
              See your peak hours, drift patterns, AI-powered discoveries, and hourly breakdown.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-6 py-3 bg-[#f0f0ec] text-[#10221c] font-medium rounded-full hover:bg-white transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </main>

        {showUpgrade && (
          <UpgradePrompt reason="self_discovery" onClose={() => setShowUpgrade(false)} />
        )}
      </div>
    );
  }

  // No data state
  if (!data) {
    return null;
  }

  // Full data state (premium users) - unchanged
  const totalSessions = data.dayBreakdown.reduce((sum, d) => sum + d.sessionCount, 0);

  return (
    <div className="min-h-screen bg-[#f7faf8]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-5">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#7c9389] hover:text-[#10221c] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#10221c] tracking-tight mb-2">Your Focus Fingerprint</h1>
          <p className="text-[#7c9389]">
            Patterns and insights based on your focus sessions. Updated as you complete more.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <GrowthCard growth={data.growth} totalSessions={totalSessions} />
          </div>
          <PeakHoursCard peakHours={data.peakHours} hourBreakdown={data.hourBreakdown} />
          <DriftPatternCard driftPattern={data.driftPattern} />
          <DiscoveriesCard discoveries={data.discoveries} />
          <DayBreakdownCard dayBreakdown={data.dayBreakdown} />
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-[#7c9389] mb-4">
            The more you focus, the smarter these insights become.
          </p>
          <Link
            href="/session/start"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#10221c] text-[#f0f0ec] font-medium rounded-full hover:bg-[#1a3229] transition-colors"
          >
            Start Focus Session
          </Link>
        </div>
      </main>
    </div>
  );
}