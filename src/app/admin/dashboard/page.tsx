'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  Bell, 
  Brain,
  Mail,
  Lock,
  RefreshCw,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    signups: { today: number; week: number; month: number };
    growth: Record<string, number>;
    retention: { day1: number; day7: number };
  };
  engagement: {
    totalSessions: number;
    completedSessions: number;
    avgFocusQuality: number;
    avgSessionsPerUser: number;
    topUsers: Array<{ userId: string; sessionCount: number }>;
    hourlyActivity: Record<number, number>;
  };
  interventions: {
    total: number;
    accepted: number;
    effective: number;
    acceptRate: number;
    effectiveRate: number;
    variantStats: Record<string, { total: number; accepted: number; effective: number }>;
  };
  patterns: {
    total: number;
    avgConfidence: number;
  };
  waitlist: {
    total: number;
    today: number;
    week: number;
  };
  generatedAt: string;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async (pwd: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: { 'x-admin-password': pwd },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid password');
        }
        throw new Error('Failed to fetch analytics');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics(password);
  };

  const handleRefresh = () => {
    fetchAnalytics(password);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#1a3a2f]" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-white">Stride Admin</span>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-lime-400"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 bg-lime-400 text-[#1a3a2f] font-medium rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0f2a1f] text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#1a3a2f]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold">Stride Admin</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">
              Updated: {data ? new Date(data.generatedAt).toLocaleTimeString() : '-'}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* User Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1a3a2f]" />
            User Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Users"
              value={data?.users.total || 0}
              icon={<Users className="w-5 h-5" />}
            />
            <MetricCard
              label="Active (7d)"
              value={data?.users.active || 0}
              icon={<Activity className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              label="Signups Today"
              value={data?.users.signups.today || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="Signups (Month)"
              value={data?.users.signups.month || 0}
              icon={<Calendar className="w-5 h-5" />}
            />
          </div>
          
          {/* Retention */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Day 1 Retention</p>
              <p className="text-2xl font-bold text-gray-900">{data?.users.retention.day1 || 0}%</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-lime-500 rounded-full"
                  style={{ width: `${data?.users.retention.day1 || 0}%` }}
                />
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Day 7 Retention</p>
              <p className="text-2xl font-bold text-gray-900">{data?.users.retention.day7 || 0}%</p>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-lime-500 rounded-full"
                  style={{ width: `${data?.users.retention.day7 || 0}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Engagement Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#1a3a2f]" />
            Engagement
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Sessions"
              value={data?.engagement.totalSessions || 0}
              icon={<Clock className="w-5 h-5" />}
            />
            <MetricCard
              label="Completed"
              value={data?.engagement.completedSessions || 0}
              icon={<CheckCircle className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              label="Avg Focus"
              value={`${data?.engagement.avgFocusQuality || 0}/10`}
              icon={<Brain className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="Sessions/User"
              value={data?.engagement.avgSessionsPerUser || 0}
              icon={<BarChart3 className="w-5 h-5" />}
            />
          </div>

          {/* Top Users */}
          {data?.engagement.topUsers && data.engagement.topUsers.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Top Users by Sessions</p>
              <div className="space-y-2">
                {data.engagement.topUsers.slice(0, 5).map((user, i) => (
                  <div key={user.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-lime-100 text-lime-700 text-xs font-medium flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-600 font-mono">
                        {user.userId.slice(0, 8)}...
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {user.sessionCount} sessions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hourly Activity */}
          {data?.engagement.hourlyActivity && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">Activity by Hour</p>
              <div className="flex items-end gap-1 h-20">
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = data.engagement.hourlyActivity[hour] || 0;
                  const maxCount = Math.max(...Object.values(data.engagement.hourlyActivity), 1);
                  const height = (count / maxCount) * 100;
                  return (
                    <div
                      key={hour}
                      className="flex-1 bg-lime-400 rounded-t transition-all hover:bg-lime-500"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${hour}:00 - ${count} sessions`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>12am</span>
                <span>6am</span>
                <span>12pm</span>
                <span>6pm</span>
                <span>11pm</span>
              </div>
            </div>
          )}
        </section>

        {/* Intervention Metrics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1a3a2f]" />
            Interventions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Sent"
              value={data?.interventions.total || 0}
              icon={<Bell className="w-5 h-5" />}
            />
            <MetricCard
              label="Accepted"
              value={data?.interventions.accepted || 0}
              icon={<CheckCircle className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              label="Accept Rate"
              value={`${data?.interventions.acceptRate || 0}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="Effective Rate"
              value={`${data?.interventions.effectiveRate || 0}%`}
              icon={<Zap className="w-5 h-5" />}
              color="green"
            />
          </div>

          {/* Variant Performance */}
          {data?.interventions.variantStats && Object.keys(data.interventions.variantStats).length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">A/B Variant Performance</p>
              <div className="space-y-3">
                {Object.entries(data.interventions.variantStats).map(([variant, stats]) => {
                  const acceptRate = stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0;
                  const effectiveRate = stats.total ? Math.round((stats.effective / stats.total) * 100) : 0;
                  return (
                    <div key={variant} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900 capitalize">{variant}</span>
                        <span className="text-sm text-gray-500 ml-2">({stats.total} total)</span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600">{acceptRate}% accepted</span>
                        <span className="text-green-600">{effectiveRate}% effective</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Waitlist & Patterns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Waitlist */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#1a3a2f]" />
              Waitlist
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                label="Total"
                value={data?.waitlist.total || 0}
                icon={<Mail className="w-5 h-5" />}
              />
              <MetricCard
                label="Today"
                value={data?.waitlist.today || 0}
                icon={<TrendingUp className="w-5 h-5" />}
                color="green"
              />
              <MetricCard
                label="This Week"
                value={data?.waitlist.week || 0}
                icon={<Calendar className="w-5 h-5" />}
                color="blue"
              />
            </div>
          </section>

          {/* Patterns */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#1a3a2f]" />
              Pattern Analysis
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                label="Patterns Found"
                value={data?.patterns.total || 0}
                icon={<Brain className="w-5 h-5" />}
              />
              <MetricCard
                label="Avg Confidence"
                value={`${data?.patterns.avgConfidence || 0}%`}
                icon={<BarChart3 className="w-5 h-5" />}
                color="green"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  label, 
  value, 
  icon, 
  color = 'default' 
}: { 
  label: string; 
  value: number | string; 
  icon: React.ReactNode;
  color?: 'default' | 'green' | 'blue';
}) {
  const colorClasses = {
    default: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}