'use client';

import { TrendingUp, ArrowRight } from 'lucide-react';

interface GrowthCardProps {
  growth: {
    firstWeekAvg: number;
    recentAvg: number;
    firstWeekDrifts: number;
    recentDrifts: number;
    improvement: number;
  } | null;
  totalSessions: number;
}

export default function GrowthCard({ growth, totalSessions }: GrowthCardProps) {
  if (!growth) {
    return (
      <div className="bg-gradient-to-br from-[#0f2a1f] via-[#143527] to-[#1a4a35] rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.15)_0%,_transparent_60%)]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-lime-400" />
            </div>
            <h3 className="font-semibold">Your Growth</h3>
          </div>

          <p className="text-white/70 text-sm">
            Complete {10 - totalSessions} more sessions to see your growth over time.
          </p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 rounded-full transition-all"
                style={{ width: `${(totalSessions / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-white/50 mt-2">{totalSessions}/10 sessions</p>
          </div>
        </div>
      </div>
    );
  }

  const isImproving = growth.improvement > 0;
  const driftsImproved = growth.recentDrifts < growth.firstWeekDrifts;

  return (
    <div className="bg-gradient-to-br from-[#0f2a1f] via-[#143527] to-[#1a4a35] rounded-2xl p-6 text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.15)_0%,_transparent_60%)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-lime-400" />
            </div>
            <h3 className="font-semibold">Your Growth</h3>
          </div>
          {isImproving && (
            <div className="px-3 py-1 bg-lime-400/20 rounded-full">
              <span className="text-sm font-medium text-lime-300">
                +{growth.improvement}%
              </span>
            </div>
          )}
        </div>

        {/* Main comparison */}
        <div className="flex items-center gap-4 mb-6">
          {/* First week */}
          <div className="flex-1 p-4 bg-white/5 rounded-xl">
            <p className="text-xs text-white/50 mb-1">First sessions</p>
            <p className="text-2xl font-bold">{growth.firstWeekAvg}</p>
            <p className="text-xs text-white/50">avg focus</p>
          </div>

          {/* Arrow */}
          <ArrowRight className="w-5 h-5 text-lime-400 flex-shrink-0" />

          {/* Recent */}
          <div className="flex-1 p-4 bg-lime-400/10 border border-lime-400/20 rounded-xl">
            <p className="text-xs text-lime-300/70 mb-1">Recent sessions</p>
            <p className="text-2xl font-bold text-lime-300">{growth.recentAvg}</p>
            <p className="text-xs text-lime-300/70">avg focus</p>
          </div>
        </div>

        {/* Drifts comparison (if tracked) */}
        {(growth.firstWeekDrifts > 0 || growth.recentDrifts > 0) && (
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Distractions per session</span>
              <div className="flex items-center gap-2">
                <span className="text-white/50">{growth.firstWeekDrifts}</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
                <span className={driftsImproved ? 'text-lime-300 font-medium' : 'text-white'}>
                  {growth.recentDrifts}
                </span>
              </div>
            </div>
            {driftsImproved && (
              <p className="text-xs text-lime-300/70 mt-2">
                You're getting distracted less often 🎉
              </p>
            )}
          </div>
        )}

        {/* Encouragement */}
        <p className="text-sm text-white/60 mt-4 text-center">
          {isImproving
            ? 'Your focus is getting stronger. Keep it up!'
            : 'Consistency is key. Every session builds your focus muscle.'}
        </p>
      </div>
    </div>
  );
}