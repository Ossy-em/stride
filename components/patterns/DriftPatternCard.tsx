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
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Drift Pattern</h3>
        </div>
        <p className="text-sm text-gray-500">
          Complete more sessions to discover when you typically lose focus.
        </p>
      </div>
    );
  }

  const successColor =
    driftPattern.interventionSuccess >= 70
      ? 'lime'
      : driftPattern.interventionSuccess >= 40
      ? 'amber'
      : 'gray';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Drift Pattern</h3>
      </div>

      {/* Main insight */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">You typically drift around</p>
        <p className="text-3xl font-bold text-gray-900">
          Minute {driftPattern.typicalMinute}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This is when your focus tends to waver. We'll check in with you just before.
        </p>
      </div>

      {/* Visual timeline */}
      <div className="mb-6">
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          {/* Progress gradient */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-lime-400 via-amber-400 to-orange-400 rounded-full"
            style={{ width: `${Math.min((driftPattern.typicalMinute / 30) * 100, 100)}%` }}
          />
          {/* Drift marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 border-2 border-white rounded-full shadow"
            style={{ left: `${Math.min((driftPattern.typicalMinute / 30) * 100, 95)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Start</span>
          <span>15 min</span>
          <span>30 min</span>
        </div>
      </div>

      {/* Intervention success rate */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 text-${successColor}-500`} />
            <span className="text-sm font-medium text-gray-700">
              Intervention success rate
            </span>
          </div>
          <span className={`text-lg font-bold text-${successColor}-600`}>
            {driftPattern.interventionSuccess}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
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