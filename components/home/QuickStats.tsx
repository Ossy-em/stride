'use client';

import { Clock, Target, Zap } from 'lucide-react';

interface QuickStatsProps {
  todaySessions: number;
  todayMinutes: number;
  weekSessions: number;
  weekMinutes: number;
}

export default function QuickStats({
  todaySessions,
  todayMinutes,
  weekSessions,
  weekMinutes,
}: QuickStatsProps) {
  // Don't show if nothing to show
  if (todaySessions === 0 && weekSessions === 0) {
    return null;
  }

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Today's sessions */}
      <div className="p-4 bg-white border border-gray-200 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-lime-600" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Today
          </span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{todaySessions}</p>
        <p className="text-xs text-gray-500">
          session{todaySessions !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Today's focus time */}
      <div className="p-4 bg-white border border-gray-200 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-lime-600" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Today
          </span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatMinutes(todayMinutes)}
        </p>
        <p className="text-xs text-gray-500">focus time</p>
      </div>

      {/* This week's sessions */}
      <div className="p-4 bg-white border border-gray-200 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            This Week
          </span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{weekSessions}</p>
        <p className="text-xs text-gray-500">
          session{weekSessions !== 1 ? 's' : ''}
        </p>
      </div>

      {/* This week's focus time */}
      <div className="p-4 bg-white border border-gray-200 rounded-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            This Week
          </span>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {formatMinutes(weekMinutes)}
        </p>
        <p className="text-xs text-gray-500">focus time</p>
      </div>
    </div>
  );
}