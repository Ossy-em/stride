'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Zap, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';
import type { FocusFingerprintData } from '@/types';

// Pattern components
import PeakHoursCard from '@/components/patterns/PeakHoursCard';
import DriftPatternCard from '@/components/patterns/DriftPatternCard';
import DiscoveriesCard from '@/components/patterns/DiscoveriesCard';
import GrowthCard from '@/components/patterns/GrowthCard';
import DayBreakdownCard from '@/components/patterns/DayBreakdownCard';

interface InsufficientDataResponse {
  insufficient_data: true;
  sessions_completed: number;
  sessions_needed: number;
}

type PatternsResponse = FocusFingerprintData | InsufficientDataResponse;

export default function PatternsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<FocusFingerprintData | null>(null);
  const [insufficientData, setInsufficientData] = useState<{
    completed: number;
    needed: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#1a3a2f] animate-pulse" />
          </div>
          <p className="text-gray-500 font-medium">Analyzing your patterns...</p>
        </div>
      </div>
    );
  }

  // Insufficient data state
  if (insufficientData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
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

        {/* Locked state */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gray-100 flex items-center justify-center">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Your Focus Fingerprint is Forming
          </h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Complete {insufficientData.needed - insufficientData.completed} more focus sessions to
            unlock personalized insights about how you focus.
          </p>

          {/* Progress */}
          <div className="max-w-xs mx-auto mb-8">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-500 rounded-full transition-all"
                style={{
                  width: `${(insufficientData.completed / insufficientData.needed) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {insufficientData.completed} of {insufficientData.needed} sessions
            </p>
          </div>

          <Link
            href="/session/start"
            className="inline-flex items-center gap-2 px-6 py-3 bg-lime-400 text-[#1a3a2f] font-semibold rounded-full hover:bg-lime-300 transition-colors"
          >
            Start a Focus Session
          </Link>
        </main>
      </div>
    );
  }

  // No data state
  if (!data) {
    return null;
  }

  // Calculate total sessions for growth card
  const totalSessions = data.dayBreakdown.reduce((sum, d) => sum + d.sessionCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-lime-600" />
            <span className="text-sm font-medium text-lime-600">Self Discovery</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Focus Fingerprint</h1>
          <p className="text-gray-500">
            Patterns and insights based on your focus sessions. Updated as you complete more.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Growth Card - Full width on top */}
          <div className="lg:col-span-2">
            <GrowthCard growth={data.growth} totalSessions={totalSessions} />
          </div>

          {/* Peak Hours */}
          <PeakHoursCard peakHours={data.peakHours} hourBreakdown={data.hourBreakdown} />

          {/* Drift Pattern */}
          <DriftPatternCard driftPattern={data.driftPattern} />

          {/* Discoveries */}
          <DiscoveriesCard discoveries={data.discoveries} />

          {/* Day Breakdown */}
          <DayBreakdownCard dayBreakdown={data.dayBreakdown} />
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">
            The more you focus, the smarter these insights become.
          </p>
          <Link
            href="/session/start"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3a2f] text-white font-medium rounded-full hover:bg-[#0f2a1f] transition-colors"
          >
            Start Focus Session
          </Link>
        </div>
      </main>
    </div>
  );
}