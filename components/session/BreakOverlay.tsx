'use client';

import { useState, useEffect } from 'react';
import { Wind, RotateCcw, Hand, Eye } from 'lucide-react';

interface BreakOverlayProps {
  strategy: 'take_break' | 'switch_task' | 'push_through' | 'check_in';
  onComplete: () => void;
  duration?: number; // seconds, default 30
}

export default function BreakOverlay({ 
  strategy, 
  onComplete, 
  duration = 30 
}: BreakOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [isExiting, setIsExiting] = useState(false);


  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(onComplete, 300); // Allow exit animation
  };

  const handleSkip = () => {
    handleComplete();
  };

 
  const breakActivities = [
    { icon: Wind, text: 'Take 3 deep breaths', duration: '10 sec' },
    { icon: RotateCcw, text: 'Roll your shoulders', duration: '10 sec' },
    { icon: Hand, text: 'Stretch your hands', duration: '5 sec' },
    { icon: Eye, text: 'Look away from screen', duration: '5 sec' },
  ];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
   
      <div className="absolute inset-0 bg-[#0f2a1f]/90 backdrop-blur-sm" />

  
      <div 
        className={`relative z-10 w-full max-w-sm text-center transition-all duration-300 ${
          isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >

        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="#84cc16"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - secondsLeft / duration)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white tabular-nums">
              {secondsLeft}
            </span>
          </div>
        </div>

  
        <h2 className="text-xl font-semibold text-white mb-2">Quick Reset</h2>
        <p className="text-white/60 text-sm mb-8">
          Your timer is still running. Take a moment.
        </p>

     
        <div className="space-y-3 mb-8">
          {breakActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10"
            >
              <div className="w-8 h-8 rounded-lg bg-lime-500/20 flex items-center justify-center">
                <activity.icon className="w-4 h-4 text-lime-400" />
              </div>
              <span className="text-white/80 text-sm flex-1 text-left">
                {activity.text}
              </span>
              <span className="text-white/40 text-xs">{activity.duration}</span>
            </div>
          ))}
        </div>

   
        <button
          onClick={handleSkip}
          className="text-white/50 text-sm hover:text-white/80 transition-colors"
        >
          Skip & continue →
        </button>
      </div>
    </div>
  );
}