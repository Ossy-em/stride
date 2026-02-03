'use client';

import { Play, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StartSessionCTAProps {
  suggestedDuration: number;
  peakHours: { start: number; end: number; improvement?: number } | null;
  isInPeakHours: boolean;
}

export default function StartSessionCTA({
  suggestedDuration,
  peakHours,
  isInPeakHours,
}: StartSessionCTAProps) {
  const router = useRouter();

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    if (hour > 12) return `${hour - 12}pm`;
    return `${hour}am`;
  };

  return (
    <div className="bg-gradient-to-br from-[#0f2a1f] via-[#143527] to-[#1a4a35] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
   
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.15)_0%,_transparent_60%)]" />

      <div className="relative z-10">

        {isInPeakHours && peakHours && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-lime-400/20 border border-lime-400/30 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span className="text-xs font-medium text-lime-300">
              You're in your peak focus window
            </span>
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          Ready for a focus session?
        </h2>

 
       {suggestedDuration !== 25 && (
  <div className="flex items-center gap-2 text-white/60 mb-6">
    <Clock className="w-4 h-4" />
    <span className="text-sm">
      Suggested: {suggestedDuration} min
      <span className="text-white/40 ml-1">(based on your patterns)</span>
    </span>
  </div>
)}

      
        <button
          onClick={() => router.push('/session/start')}
          className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-lime-400 text-[#1a3a2f] font-semibold rounded-full hover:bg-lime-300 transition-all hover:shadow-lg hover:shadow-lime-400/25"
        >
          <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Start Focus Session</span>
        </button>

  
        {!isInPeakHours && peakHours && (
          <p className="mt-4 text-xs text-white/40">
            Your peak hours are {formatHour(peakHours.start)}–{formatHour(peakHours.end)}.
            Sessions then are {typeof peakHours.improvement === 'number' ? `${peakHours.improvement}%` : 'often'} more effective.
          </p>
        )}
      </div>
    </div>
  );
}