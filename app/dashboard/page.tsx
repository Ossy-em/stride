'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import type { DashboardResponse } from '@/types';
import DashboardWrapper from '@/components/shared/DashboardWrapper';

// Home components
import GreetingCard from '@/components/home/GreetingCard';
import StartSessionCTA from '@/components/home/StartSessionCTA';
import StreakBanner from '@/components/home/StreakBanner';
import CuriosityHook from '@/components/home/CuriosityHook';
import QuickStats from '@/components/home/QuickStats';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/icons/icon.png" 
            alt="Stride" 
            className="w-24 h-24 animate-pulse"
          />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Couldn't load your data
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-24 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/icons/stride-light.png" 
              alt="Stride" 
              className="h-16"
            />
          </a>
          {userPlan === 'premium' && (
            <div className="flex items-center">
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-lime-400 text-[#1a3a2f] rounded-full">
                Pro
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Single Column, Focused */}
      <main className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-24 py-8 space-y-6">
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
          <div className="p-5 bg-white border border-gray-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-base">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Insight</p>
                <p className="text-gray-700 leading-relaxed">{data.insights[0]}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </DashboardWrapper>
  );
}