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
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Peak Hours</h3>
        </div>
        <p className="text-sm text-gray-500">
          Complete more sessions to discover your peak focus hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Peak Hours</h3>
        </div>
        {peakHours.improvement > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-lime-100 rounded-full">
            <Zap className="w-3 h-3 text-lime-600" />
            <span className="text-xs font-medium text-lime-700">
              +{peakHours.improvement}% focus
            </span>
          </div>
        )}
      </div>

      {/* Main insight */}
      <div className="mb-6">
        <p className="text-2xl font-bold text-gray-900">
          {formatHour(peakHours.start)} – {formatHour(peakHours.end)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          You focus {peakHours.improvement}% better during this window.
        </p>
      </div>

      {/* Hour breakdown visualization */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
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
                      ? 'bg-lime-500'
                      : isCurrentHour
                      ? 'bg-amber-400'
                      : h.sessionCount > 0
                      ? 'bg-gray-300'
                      : 'bg-gray-100'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${formatHour(h.hour)}: ${h.avgScore}/100 (${h.sessionCount} sessions)`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>6am</span>
          <span>12pm</span>
          <span>6pm</span>
          <span>11pm</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-lime-500" />
          <span className="text-xs text-gray-500">Peak hours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-400" />
          <span className="text-xs text-gray-500">Now</span>
        </div>
      </div>
    </div>
  );
}