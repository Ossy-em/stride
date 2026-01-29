'use client';

import { Sparkles, Target, Lightbulb, TrendingUp, Zap } from 'lucide-react';

interface AIInsightsProps {
  insights: string[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
  const insightIcons = [Target, Lightbulb, TrendingUp, Zap];
  
  // Rotating colors for variety while staying on-brand
  const insightColors = [
    { bg: 'from-[#1a3a2f] to-[#143527]', icon: 'text-white' },
    { bg: 'from-lime-500 to-lime-600', icon: 'text-white' },
    { bg: 'from-amber-400 to-amber-500', icon: 'text-white' },
    { bg: 'from-[#0f2a1f] to-[#1a4a35]', icon: 'text-lime-400' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-lime-50/30 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-medium text-gray-700 mb-2">No insights yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Complete a few more sessions to unlock personalized AI insights.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = insightIcons[index % insightIcons.length];
              const colors = insightColors[index % insightColors.length];

              return (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-lime-200 hover:bg-lime-50/30 transition-all duration-200 group cursor-default"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 flex-1 pt-2">
                    {insight}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer hint */}
        {insights.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Insights update based on your focus patterns
            </p>
          </div>
        )}
      </div>
    </div>
  );
}