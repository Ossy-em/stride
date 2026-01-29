'use client';

import { Flame, TrendingUp, TrendingDown } from 'lucide-react';

interface FocusScoreCardProps {
  todayScore: number;
  weeklyTrend: number;
  // TODO: Add these props when connecting to real data
  // currentStreak?: number;
}

export default function FocusScoreCard({ todayScore, weeklyTrend }: FocusScoreCardProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayScore / 100) * circumference;

  // Updated colors to match landing page palette
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#65a30d'; // lime-600
    if (score >= 60) return '#84cc16'; // lime-500
    if (score >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    return 'Needs Work';
  };

  const trendPositive = weeklyTrend >= 0;

  // TODO: DUMMY DATA - Replace with prop from API
  const currentStreak = 5;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[#1a3a2f]" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Today's Focus</h2>
      </div>

      <div className="flex items-center justify-between gap-6">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#F3F4F6"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={getScoreColor(todayScore)}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className="text-4xl font-bold tabular-nums"
              style={{ color: getScoreColor(todayScore) }}
            >
              {todayScore}
            </span>
            <span className="text-sm text-gray-400">/100</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Weekly Trend */}
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                trendPositive
                  ? 'bg-lime-50 text-lime-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {trendPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {trendPositive ? '+' : ''}{weeklyTrend}% from last week
            </div>
          </div>

          {/* Streak Counter - TODO: DUMMY DATA (currentStreak) */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-amber-600">{currentStreak} Days</div>
              <div className="text-xs text-amber-600/70">Current Streak</div>
            </div>
          </div>

          {/* Quick Insight */}
          <p className="text-sm text-gray-500 leading-relaxed">
            {todayScore >= 80 && "Exceptional focus today! You're in the zone."}
            {todayScore >= 60 && todayScore < 80 && "Solid focus. Keep the momentum going."}
            {todayScore >= 40 && todayScore < 60 && "Decent session. Room to improve."}
            {todayScore < 40 && "Tough day? Tomorrow is a fresh start."}
          </p>
        </div>
      </div>

      {/* Score Label Badge */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Focus Rating</span>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${getScoreColor(todayScore)}15`,
              color: getScoreColor(todayScore),
            }}
          >
            {getScoreLabel(todayScore)}
          </span>
        </div>
      </div>
    </div>
  );
}