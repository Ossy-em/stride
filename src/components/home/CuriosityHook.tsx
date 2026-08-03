'use client';

import { Sparkles, ChevronRight, Clock, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface CuriosityHookProps {
  peakHours: { start: number; end: number; improvement: number } | null;
  bestDay: { day: string; avgScore: number } | null;
  totalSessions: number;
}

export default function CuriosityHook({
  peakHours,
  bestDay,
  totalSessions,
}: CuriosityHookProps) {
  // Don't show if not enough data
  if (totalSessions < 5) {
    return (
      <div className="p-5 bg-[#f4f7f2] rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-[#7c9389]" />
          <span className="font-medium text-[#48645b]">Your Focus Fingerprint</span>
        </div>
        <p className="text-sm text-[#7c9389]">
          Complete {5 - totalSessions} more session{5 - totalSessions > 1 ? 's' : ''} to unlock
          personalized patterns and insights about how you focus.
        </p>
        <div className="mt-3 w-full bg-[#dfe4e0] rounded-full h-1.5">
          <div
            className="bg-[#10221c] h-1.5 rounded-full transition-all"
            style={{ width: `${(totalSessions / 5) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[#7c9389]">{totalSessions}/5 sessions</p>
      </div>
    );
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    if (hour > 12) return `${hour - 12}pm`;
    return `${hour}am`;
  };

  // Build preview insights
  const previewInsights = [];

  if (peakHours) {
    previewInsights.push({
      icon: Clock,
      text: `Peak: ${formatHour(peakHours.start)}–${formatHour(peakHours.end)}`,
    });
  }

  if (bestDay) {
    previewInsights.push({
      icon: Calendar,
      text: `Best day: ${bestDay.day}s`,
    });
  }

  return (
    <Link href="/patterns" className="block group">
      <div className="p-4 bg-white rounded-2xl shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)] hover:shadow-[0_1px_2px_rgba(16,34,28,0.05),0_18px_44px_rgba(16,34,28,0.09)] transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#10221c] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#8aa89c]" />
            </div>
            <span className="font-semibold text-[#10221c]">Your Focus Fingerprint</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#7c9389] group-hover:text-[#10221c] group-hover:translate-x-1 transition-all" />
        </div>

        {/* Preview insights */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {previewInsights.map((insight, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#48645b]"
            >
              <insight.icon className="w-3.5 h-3.5 text-[#7c9389]" />
              {insight.text}
            </div>
          ))}
          <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2f5648]">
            <TrendingUp className="w-3.5 h-3.5" />
            See all patterns →
          </div>
        </div>
      </div>
    </Link>
  );
}