'use client';

import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DiscoveriesCardProps {
  discoveries: {
    type: 'positive' | 'negative' | 'neutral';
    insight: string;
  }[];
}

export default function DiscoveriesCard({ discoveries }: DiscoveriesCardProps) {
  const getIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-lime-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBgColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'bg-lime-50 border-lime-100';
      case 'negative':
        return 'bg-red-50 border-red-100';
      case 'neutral':
        return 'bg-gray-50 border-gray-100';
    }
  };

  if (discoveries.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Discoveries</h3>
        </div>
        <p className="text-sm text-gray-500">
          Keep focusing! Patterns will emerge as you complete more sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-purple-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Discoveries</h3>
      </div>

      {/* Discovery list */}
      <div className="space-y-3">
        {discoveries.map((discovery, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-xl border ${getBgColor(
              discovery.type
            )}`}
          >
            <div className="mt-0.5">{getIcon(discovery.type)}</div>
            <p className="text-sm text-gray-700 leading-relaxed">{discovery.insight}</p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Discoveries update as you complete more sessions
      </p>
    </div>
  );
}