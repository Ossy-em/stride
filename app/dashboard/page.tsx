import FocusScoreCard from '@/components/FocusScoreCard';
import WeeklyHeatmap from '@/components/WeeklyHeatmap';
import AIInsights from '@/components/AIInsights';
import Link from 'next/link';
import type { DashboardStats } from '@/types';

async function getDashboardData(): Promise<DashboardStats> {
  const res = await fetch('http://localhost:3000/api/dashboard', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  return res.json();
}

export default async function DashboardPage() {
  const stats = await getDashboardData();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
  
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link 
            href="/session/start"
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-button transition-smooth"
          >
            New Session
          </Link>
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1">
            <FocusScoreCard 
              todayScore={stats.today_focus_score} 
              weeklyTrend={stats.weekly_trend} 
            />
          </div>

       
          <div className="lg:col-span-2">
            <AIInsights insights={stats.insights} />
          </div>

      
          <div className="lg:col-span-3">
            <WeeklyHeatmap data={stats.heatmap_data} />
          </div>
        </div>
      </div>
    </div>
  );
}