'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Play, Zap, RefreshCw } from 'lucide-react';
import FocusScoreCard from '@/components/FocusScoreCard';
import WeeklyHeatmap from '@/components/WeeklyHeatmap';
import AIInsights from '@/components/AIInsights';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center animate-pulse">
            <Zap className="w-6 h-6 text-[#1a3a2f]" />
          </div>
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">No data available</h2>
          <p className="text-gray-500 max-w-sm">
            Start your first focus session to see your dashboard come to life.
          </p>
          <button
            onClick={() => router.push('/session/start')}
            className="mt-2 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start First Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#1a3a2f]" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold text-gray-900">Stride</span>
              </a>
              <div className="hidden sm:block h-6 w-px bg-gray-200" />
              <h1 className="hidden sm:block text-lg text-gray-600">Dashboard</h1>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => router.push('/session/start')}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1a3a2f] to-[#143527] text-white font-medium rounded-full hover:from-[#0f2a1f] hover:to-[#1a3a2f] transition-all shadow-lg hover:shadow-xl"
            >
              <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Start Focus Session</span>
              <span className="sm:hidden">Start</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}! 👋
          </h2>
          <p className="text-gray-500">
            Here's how your focus is tracking this week.
          </p>
        </div>

        {/* Focus Score Card - Full Width */}
        <div className="mb-8">
          <FocusScoreCard
            todayScore={dashboardData.today_focus_score}
            weeklyTrend={dashboardData.weekly_trend}
          />
        </div>

        {/* Two Column Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          <WeeklyHeatmap data={dashboardData.heatmap_data} />
          <AIInsights insights={dashboardData.insights} />
        </div>
      </main>
    </div>
  );
}