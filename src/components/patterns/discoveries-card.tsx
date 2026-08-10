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
        return <TrendingUp className="w-4 h-4 text-[#10221c]" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-[#b8862f]" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-[#7c9389]" />;
    }
  };

  const getBgColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'bg-[#f4f7f2]';
      case 'negative':
        return 'bg-[#d9a441]/8';
      case 'neutral':
        return 'bg-[#f4f7f2]';
    }
  };

  if (discoveries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold text-[#10221c]">Discoveries</h3>
        </div>
        <p className="text-sm text-[#7c9389]">
          Keep focusing! Patterns will emerge as you complete more sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,34,28,0.04),0_12px_32px_rgba(16,34,28,0.06)]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-semibold text-[#10221c]">Discoveries</h3>
      </div>

      {/* Discovery list */}
      <div className="space-y-3">
        {discoveries.map((discovery, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-xl ${getBgColor(
              discovery.type
            )}`}
          >
            <div className="mt-0.5">{getIcon(discovery.type)}</div>
            <p className="text-sm text-[#48645b] leading-relaxed">{discovery.insight}</p>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-[#7c9389] mt-4 text-center">
        Discoveries update as you complete more sessions
      </p>
    </div>
  );
}