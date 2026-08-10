'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { DashboardResponse } from '@/types';
import DashboardWrapper from '@/components/shared/dashboard-wrapper';
import { Wordmark } from '@/components/ui/wordmark';

// Home components
import GreetingCard from '@/components/home/greeting-card';
import StartSessionCTA from '@/components/home/start-session-cta';
import StreakBanner from '@/components/home/streak-banner';
import CuriosityHook from '@/components/home/curiosity-hook';
import QuickStats from '@/components/home/quick-stats';
import { Spinner } from '@/components/ui/spinner';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch dashboard data + plan
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
      fetchUserPlan();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const res = await fetch(`/api/dashboard?tz=${tz}`);

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData: DashboardResponse = await res.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const tz = encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone);
      const res = await fetch(`/api/user/plan?tz=${tz}`);
      if (res.ok) {
        const planData = await res.json();
        setUserPlan(planData.plan || 'free');
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
    }
  };

  // Check if current time is within peak hours
  const isInPeakHours = () => {
    if (!data?.patterns.peakHours) return false;
    const currentHour = new Date().getHours();
    return (
      currentHour >= data.patterns.peakHours.start &&
      currentHour < data.patterns.peakHours.end
    );
  };

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f7faf8] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#eef1ed] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#10221c]" />
          </div>
          <h2 className="text-xl font-bold text-[#10221c] tracking-tight mb-2">
            Couldn't load your data
          </h2>
          <p className="text-[#48645b] mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2.5 bg-[#10221c] text-[#f0f0ec] font-medium rounded-full hover:bg-[#1a3229] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state (shouldn't happen, but just in case)
  if (!data) {
    return null;
  }

  return (
    <DashboardWrapper>
    <div className="min-h-screen bg-[#f7faf8]">

      {/* Main Content - Single Column, Focused */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-8 space-y-4">
        {userPlan === 'premium' && (
          <div className="flex justify-end -mb-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-[#10221c] text-[#f0f0ec] rounded-full">
              Pro
            </span>
          </div>
        )}

        {/* Greeting */}
        <GreetingCard
          firstName={data.user.firstName}
          timeOfDay={data.greeting.timeOfDay}
          message={data.greeting.message}
          subMessage={data.greeting.subMessage}
        />

        {/* Start Session CTA */}
        <StartSessionCTA
          suggestedDuration={data.patterns.suggestedDuration}
          peakHours={data.patterns.peakHours}
          isInPeakHours={isInPeakHours()}
        />

        {/* Streak Banner */}
        <StreakBanner
          current={data.streak.current}
          longest={data.streak.longest}
          isAtRisk={data.streak.isAtRisk}
        />

        {/* Quick Stats (only if has activity) */}
        {(data.today.sessions > 0 || data.week.sessions > 0) && (
          <QuickStats
            todaySessions={data.today.sessions}
            todayMinutes={data.today.focusMinutes}
            weekSessions={data.week.sessions}
            weekMinutes={data.week.focusMinutes}
          />
        )}

        {/* Curiosity Hook to Patterns */}
        <CuriosityHook
          peakHours={data.patterns.peakHours}
          bestDay={data.patterns.bestDay}
          totalSessions={data.records.totalSessions}
        />

        {/* AI Insight (just one, conversational) */}
        {data.insights.length > 0 && !data.isNewUser && (
          <div className="p-4 bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
            <p className="text-sm font-medium text-[#7c9389] mb-1">Insight</p>
            <p className="text-[15px] text-[#48645b] leading-relaxed">{data.insights[0]}</p>
          </div>
        )}
      </main>
    </div>
    </DashboardWrapper>
  );
}