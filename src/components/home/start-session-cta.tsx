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
    <div className="bg-[#10221c] rounded-3xl p-6 relative overflow-hidden">
   
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(124,147,137,0.18)_0%,_transparent_60%)]" />

      <div className="relative z-10">

        {isInPeakHours && peakHours && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f0f0ec]/10 border border-[#f0f0ec]/20 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#8aa89c]" />
            <span className="text-xs font-medium text-[#8aa89c]">
              You're in your peak focus window
            </span>
          </div>
        )}

        <h2 className="text-xl font-bold text-white tracking-tight mb-2">
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
          className="group w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-3.5 bg-[#f0f0ec] text-[#10221c] font-semibold rounded-full hover:bg-white transition-all"
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