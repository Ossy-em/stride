'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  const CHECK_IN_INTERVAL = 20 * 60; 

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newTime = prev + 1;
        
        // Check if it's time for a check-in (every 20 mins)
        if (newTime - lastCheckInTime >= CHECK_IN_INTERVAL && newTime > 0) {
          setShowCheckIn(true);
          setLastCheckInTime(newTime);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCheckInTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining time
  const remainingSeconds = Math.max(0, (plannedDuration * 60) - elapsedSeconds);
  const remainingFormatted = formatTime(remainingSeconds);

  const handleEndSession = () => {

    router.push(`/session/end?id=${sessionId}`);
  };

  return (
    <>
     <div className="min-h-screen flex flex-col items-center justify-center timer-bg transition-smooth">

   
        <div className="text-center mb-12">
          <p className="text-text-secondary text-sm uppercase tracking-wide mb-2">
            Current Task
          </p>
    <h1 className="text-2xl font-semibold">            {taskDescription}
          </h1>
        </div>

        {/* Timer Display */}
        <div className="relative">
          <div className="timer-display animate-pulse-gentle">
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-center mt-4 text-text-secondary text-sm">
            {remainingSeconds > 0 ? `${remainingFormatted} remaining` : 'Time s up!'}
          </p>
        </div>

 
        <button
          onClick={handleEndSession}
          className="mt-16 px-8 py-3 cursor-pointer rounded-button bg-white dark:bg-card-dark text-teal-500 font-medium hover:shadow-card transition-smooth"
        >
          End Session
        </button>
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