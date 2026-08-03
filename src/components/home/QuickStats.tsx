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
      <div className="p-3.5 bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,34,28,0.04),0_10px_28px_rgba(16,34,28,0.05)]">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-[#10221c]" />
          <span className="text-xs font-medium text-[#7c9389]">
            Today
          </span>
        </div>
        <p className="text-2xl font-bold text-[#10221c] tracking-tight">{todaySessions}</p>
        <p className="text-xs text-[#7c9389]">
          session{todaySessions !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Today's focus time */}
      <div className="p-3.5 bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,34,28,0.04),0_10px_28px_rgba(16,34,28,0.05)]">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#10221c]" />
          <span className="text-xs font-medium text-[#7c9389]">
            Today
          </span>
        </div>
        <p className="text-2xl font-bold text-[#10221c] tracking-tight">
          {formatMinutes(todayMinutes)}
        </p>
        <p className="text-xs text-[#7c9389]">focus time</p>
      </div>

      {/* This week's sessions */}
      <div className="p-3.5 bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,34,28,0.04),0_10px_28px_rgba(16,34,28,0.05)]">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-[#10221c]" />
          <span className="text-xs font-medium text-[#7c9389]">
            This Week
          </span>
        </div>
        <p className="text-2xl font-bold text-[#10221c] tracking-tight">{weekSessions}</p>
        <p className="text-xs text-[#7c9389]">
          session{weekSessions !== 1 ? 's' : ''}
        </p>
      </div>

      {/* This week's focus time */}
      <div className="p-3.5 bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,34,28,0.04),0_10px_28px_rgba(16,34,28,0.05)]">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#10221c]" />
          <span className="text-xs font-medium text-[#7c9389]">
            This Week
          </span>
        </div>
        <p className="text-2xl font-bold text-[#10221c] tracking-tight">
          {formatMinutes(weekMinutes)}
        </p>
        <p className="text-xs text-[#7c9389]">focus time</p>
      </div>
    </div>
  );
}