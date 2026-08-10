'use client';

import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface DriftPatternCardProps {
  driftPattern: {
    typicalMinute: number;
    interventionSuccess: number;
  } | null;
}

export default function DriftPatternCard({ driftPattern }: DriftPatternCardProps) {
  if (!driftPattern) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-[#10221c]">Drift pattern</h3>
        </div>
        <p className="text-sm text-[#7c9389]">
          Complete more sessions to discover when you typically lose focus.
        </p>
      </div>
    );
  }

  const successTextClass =
    driftPattern.interventionSuccess >= 70
      ? 'text-[#10221c]'
      : driftPattern.interventionSuccess >= 40
      ? 'text-[#b8862f]'
      : 'text-[#7c9389]';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-semibold text-[#10221c]">Drift pattern</h3>
      </div>

      {/* Main insight */}
      <div className="mb-6">
        <p className="text-sm text-[#7c9389] mb-1">You typically drift around</p>
        <p className="text-3xl font-bold text-[#10221c] tracking-tight">
          Minute {driftPattern.typicalMinute}
        </p>
        <p className="text-sm text-[#7c9389] mt-2">
          This is when your focus tends to waver. We'll check in with you just before.
        </p>
      </div>

      {/* Visual timeline */}
      <div className="mb-6">
        <div className="relative h-2 bg-[#eef1ed] rounded-full overflow-hidden">
          {/* Progress gradient */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7c9389] to-[#10221c] rounded-full"
            style={{ width: `${Math.min((driftPattern.typicalMinute / 30) * 100, 100)}%` }}
          />
          {/* Drift marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#10221c] border-2 border-white rounded-full shadow"
            style={{ left: `${Math.min((driftPattern.typicalMinute / 30) * 100, 95)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#7c9389] mt-2">
          <span>Start</span>
          <span>15 min</span>
          <span>30 min</span>
        </div>
      </div>

      {/* Intervention success rate */}
      <div className="p-4 bg-[#f4f7f2] rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 ${successTextClass}`} />
            <span className="text-sm font-medium text-[#48645b]">
              Intervention success rate
            </span>
          </div>
          <span className={`text-lg font-bold ${successTextClass}`}>
            {driftPattern.interventionSuccess}%
          </span>
        </div>
        <p className="text-xs text-[#7c9389] mt-2">
          {driftPattern.interventionSuccess >= 70
            ? 'Great! Nudges are really helping you refocus.'
            : driftPattern.interventionSuccess >= 40
            ? 'Nudges help sometimes. We\'re learning what works for you.'
            : 'You prefer pushing through — we\'ll adjust our approach.'
        }
        </p>
      </div>
    </div>
  );
}