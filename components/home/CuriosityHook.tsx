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
      <div className="p-5 bg-gray-50 border border-gray-200 border-dashed rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-600">Your Focus Fingerprint</span>
        </div>
        <p className="text-sm text-gray-500">
          Complete {5 - totalSessions} more session{5 - totalSessions > 1 ? 's' : ''} to unlock
          personalized patterns and insights about how you focus.
        </p>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-lime-500 h-1.5 rounded-full transition-all"
            style={{ width: `${(totalSessions / 5) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-400">{totalSessions}/5 sessions</p>
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
      <div className="p-5 bg-white border border-gray-200 rounded-2xl hover:border-lime-300 hover:shadow-md transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a3a2f] to-[#143527] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-lime-400" />
            </div>
            <span className="font-semibold text-gray-900">Your Focus Fingerprint</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-lime-600 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Preview insights */}
        <div className="flex flex-wrap gap-2">
          {previewInsights.map((insight, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-600"
            >
              <insight.icon className="w-3.5 h-3.5 text-gray-400" />
              {insight.text}
            </div>
          ))}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-50 rounded-full text-sm text-lime-700">
            <TrendingUp className="w-3.5 h-3.5" />
            See all patterns →
          </div>
        </div>
      </div>
    </Link>
  );
}