'use client';

import { Clock, Zap } from 'lucide-react';

interface PeakHoursCardProps {
  peakHours: {
    start: number;
    end: number;
    improvement: number;
    sessionCount: number;
  } | null;
  hourBreakdown: {
    hour: number;
    avgScore: number;
    sessionCount: number;
  }[];
}

export default function PeakHoursCard({ peakHours, hourBreakdown }: PeakHoursCardProps) {
  const formatHour = (hour: number) => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    if (hour > 12) return `${hour - 12}pm`;
    return `${hour}am`;
  };

  // Find max score for scaling
  const maxScore = Math.max(...hourBreakdown.map((h) => h.avgScore), 1);

  // Get current hour to highlight
  const currentHour = new Date().getHours();

  if (!peakHours) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-[#10221c]">Peak hours</h3>
        </div>
        <p className="text-sm text-[#7c9389]">
          Complete more sessions to discover your peak focus hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-[#10221c]">Peak hours</h3>
        </div>
        {peakHours.improvement > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-[#eef1ed] rounded-full">
            <Zap className="w-3 h-3 text-[#2f5648]" />
            <span className="text-xs font-medium text-[#2f5648]">
              +{peakHours.improvement}% focus
            </span>
          </div>
        )}
      </div>

      {/* Main insight */}
      <div className="mb-6">
        <p className="text-2xl font-bold text-[#10221c] tracking-tight">
          {formatHour(peakHours.start)} – {formatHour(peakHours.end)}
        </p>
        <p className="text-sm text-[#7c9389] mt-1">
          You focus {peakHours.improvement}% better during this window.
        </p>
      </div>

      {/* Hour breakdown visualization */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#7c9389]">
          Focus by hour
        </p>
        <div className="flex items-end gap-1 h-20">
          {hourBreakdown.map((h) => {
            const height = h.avgScore > 0 ? (h.avgScore / maxScore) * 100 : 5;
            const isCurrentHour = h.hour === currentHour;
            const isPeakHour = h.hour >= peakHours.start && h.hour < peakHours.end;

            return (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${
                    isPeakHour
                      ? 'bg-[#10221c]'
                      : isCurrentHour
                      ? 'bg-[#8aa89c]'
                      : h.sessionCount > 0
                      ? 'bg-[#b4c5bd]'
                      : 'bg-[#eef1ed]'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${formatHour(h.hour)}: ${h.avgScore}/100 (${h.sessionCount} sessions)`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-[#7c9389]">
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#eef1ed]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#10221c]" />
          <span className="text-xs text-[#7c9389]">Peak hours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#8aa89c]" />
          <span className="text-xs text-[#7c9389]">Now</span>
        </div>
      </div>
    </div>
  );
}