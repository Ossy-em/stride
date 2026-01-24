'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Your Focus Dashboard</h1>

          <button
            onClick={() => router.push('/session/start')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-400 text-white font-medium rounded-lg hover:from-teal-600 hover:to-teal-500 transition-all shadow-lg hover:shadow-xl"
          >
            <Play className="w-5 h-5" />
            Start Focus Session
          </button>
        </div>

        <div className="grid gap-6 mb-8">
         <FocusScoreCard
  todayScore={dashboardData.today_focus_score}
  weeklyTrend={dashboardData.weekly_trend}
/>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <WeeklyHeatmap data={dashboardData.heatmap_data} />
          <AIInsights insights={dashboardData.insights} />
        </div>
      </div>
    </div>
  );
}