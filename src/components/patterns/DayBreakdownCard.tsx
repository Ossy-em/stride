'use client';

import { Calendar } from 'lucide-react';

interface DayBreakdownCardProps {
  dayBreakdown: {
    day: string;
    avgScore: number;
    sessionCount: number;
  }[];
}

export default function DayBreakdownCard({ dayBreakdown }: DayBreakdownCardProps) {
  // Find max score for scaling
  const maxScore = Math.max(...dayBreakdown.map((d) => d.avgScore), 1);

  // Get current day
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Find best and worst days
  const activeDays = dayBreakdown.filter((d) => d.sessionCount > 0);
  const bestDay = activeDays.length > 0
    ? activeDays.reduce((best, d) => (d.avgScore > best.avgScore ? d : best))
    : null;

  const getBarColor = (day: { day: string; avgScore: number; sessionCount: number }) => {
    if (day.sessionCount === 0) return 'bg-[#eef1ed]';
    if (bestDay && day.day === bestDay.day) return 'bg-[#10221c]';
    if (day.day === currentDay) return 'bg-[#8aa89c]';
    return 'bg-[#b4c5bd]';
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[#10221c]">Focus by day</h3>
        </div>
        {bestDay && (
          <span className="text-xs text-[#7c9389]">
            Best: <span className="font-medium text-[#10221c]">{bestDay.day}s</span>
          </span>
        )}
      </div>

      {/* Day bars */}
      <div className="space-y-3">
        {dayBreakdown.map((day) => {
          const width = day.avgScore > 0 ? (day.avgScore / maxScore) * 100 : 0;
          const isToday = day.day === currentDay;
          const isBest = bestDay && day.day === bestDay.day;

          return (
            <div key={day.day} className="flex items-center gap-3">
              {/* Day label */}
              <div className="w-12 flex-shrink-0">
                <span
                  className={`text-sm ${
                    isToday ? 'font-semibold text-[#10221c]' : 'text-[#7c9389]'
                  }`}
                >
                  {day.day.slice(0, 3)}
                </span>
              </div>

              {/* Bar */}
              <div className="flex-1 h-8 bg-[#f4f7f2] rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all ${getBarColor(day)}`}
                  style={{ width: `${Math.max(width, day.sessionCount > 0 ? 5 : 0)}%` }}
                />
                {/* Score label */}
                {day.sessionCount > 0 && (
                  <span
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium ${
                      width > 80 ? 'text-white' : 'text-[#7c9389]'
                    }`}
                  >
                    {day.avgScore}
                  </span>
                )}
              </div>

              {/* Session count */}
              <div className="w-16 text-right">
                <span className="text-xs text-[#7c9389]">
                  {day.sessionCount > 0 ? `${day.sessionCount} sess` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#eef1ed]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#10221c]" />
          <span className="text-xs text-[#7c9389]">Best day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#8aa89c]" />
          <span className="text-xs text-[#7c9389]">Today</span>
        </div>
      </div>
    </div>
  );
}