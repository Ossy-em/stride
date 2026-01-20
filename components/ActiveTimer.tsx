'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Square } from 'lucide-react';
import CheckInModal from './CheckInModal';

interface ActiveTimerProps {
  sessionId: string;
  taskDescription: string;
  plannedDuration: number; // minutes
}

export default function ActiveTimer({ 
  sessionId, 
  taskDescription, 
  plannedDuration 
}: ActiveTimerProps) {
  const router = useRouter();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState(0);

  const CHECK_IN_INTERVAL = 20 * 60; // 20 minutes

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newTime = prev + 1;
        
        if (newTime - lastCheckInTime >= CHECK_IN_INTERVAL && newTime > 0) {
          setShowCheckIn(true);
          setLastCheckInTime(newTime);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCheckInTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, (plannedDuration * 60) - elapsedSeconds);
  const remainingFormatted = formatTime(remainingSeconds);
  const progressPercentage = (elapsedSeconds / (plannedDuration * 60)) * 100;

  const handleEndSession = () => {
    router.push(`/session/end?id=${sessionId}`);
  };

  return (
    <>
      <div className="timer-bg flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
         
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse-gentle" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber/5 rounded-full blur-3xl animate-pulse-gentle" style={{ animationDelay: '2s' }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center gap-12">
      
          <div className="relative">
        
            <div 
              className="absolute inset-0 rounded-full border-2 border-teal-500/20"
              style={{
                width: '320px',
                height: '320px',
                animation: 'breathe-ring 4s ease-in-out infinite',
              }}
            />
            <div 
              className="absolute inset-0 rounded-full border-2 border-teal-500/10"
              style={{
                width: '380px',
                height: '380px',
                top: '-30px',
                left: '-30px',
                animation: 'breathe-ring 4s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            />

          
            <div className="relative w-80 h-80 flex items-center justify-center">
     
              <svg className="absolute inset-0 w-full h-full -rotate-90">
             
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-teal-500/10"
                />
               
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  className="text-teal-500 transition-all duration-1000"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - progressPercentage / 100)}`}
                />
              </svg>

              {/* Timer display */}
              <div className="flex flex-col items-center">
                <div className="timer-display animate-pulse-gentle">
                  {formatTime(elapsedSeconds)}
                </div>
                <p className="text-secondary text-sm mt-2 font-medium">
                  {remainingSeconds > 0 ? remainingFormatted : 'Complete!'}
                </p>
              </div>
            </div>
          </div>

          {/* Task Description */}
          <div className="text-center max-w-md px-4">
            <p className="text-secondary text-xs uppercase tracking-wider mb-2 font-medium">
              In Focus
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100">
              {taskDescription}
            </h1>
          </div>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            className="group flex items-center gap-2 px-8 py-3.5 cursor-pointer rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-medium hover:bg-white dark:hover:bg-gray-900 transition-all hover:shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <Square className="w-4 h-4 group-hover:text-teal-500 transition-colors" />
            End Session
          </button>
        </div>


        <div className="absolute bottom-8 text-center px-4">
          <p className="text-sm text-gray-400 dark:text-gray-600 italic max-w-md">
            "Focus is the gateway to excellence."
          </p>
        </div>
      </div>

      {/* Check-In Modal */}
      {showCheckIn && (
        <CheckInModal
          sessionId={sessionId}
          onClose={() => setShowCheckIn(false)}
        />
      )}
    </>
  );
}