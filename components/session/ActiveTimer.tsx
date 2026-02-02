'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Square, Sparkles } from 'lucide-react';
import CheckInModal from './CheckInModal';
import InterventionNotification from './InterventionNotification';

// NOTIFICATION HELPERS

// Request notification permission
const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Send browser notification
const sendNotification = (title: string, body: string) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }
  
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'stride-intervention',
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 30000);
  }
};

// Check if notifications are blocked at system/browser level
const isNotificationBlocked = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'denied';
};

// COMPONENT

interface ActiveTimerProps {
  sessionId: string;
  taskDescription: string;
  plannedDuration: number
}

export default function ActiveTimer({ 
  sessionId, 
  taskDescription, 
  plannedDuration 
}: ActiveTimerProps) {
  const router = useRouter();

  const [sessionStartTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState(0);
  
  const [intervention, setIntervention] = useState<any>(null);
  const [showIntervention, setShowIntervention] = useState(false);
  const [interventionCount, setInterventionCount] = useState(0);
  const [interventionShownAt, setInterventionShownAt] = useState<number | null>(null);
  
  const [notificationPermission, setNotificationPermission] = useState<boolean | null>(null);
  const [showNotificationHelp, setShowNotificationHelp] = useState(false);

  const CHECK_IN_INTERVAL = 20 * 60; 


  useEffect(() => {
    requestNotificationPermission().then((granted) => {
      setNotificationPermission(granted);
      if (granted) {
        console.log('🔔 Notification permission granted');
      } else {
        console.log('🔕 Notification permission denied or unavailable');
  
        if (isNotificationBlocked()) {
          setShowNotificationHelp(true);
        }
      }
    });
  }, []);

  // Timer interval 
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - sessionStartTime) / 1000);
      setElapsedSeconds(elapsed);
      

      if (elapsed - lastCheckInTime >= CHECK_IN_INTERVAL && elapsed > 0) {
        setShowCheckIn(true);
        setLastCheckInTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, lastCheckInTime]);


  useEffect(() => {
    const checkForIntervention = async () => {
      const elapsedMins = Math.floor(elapsedSeconds / 60);
      
      // Max 3 interventions per session
      if (interventionCount >= 3) {
        return;
      }
      
      if (elapsedMins >= 1 && !showIntervention) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const response = await fetch('/api/interventions/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              elapsedMinutes: elapsedMins,
            }),
            signal: controller.signal, 
          });

          clearTimeout(timeoutId);

          const data = await response.json();

          if (data.needed && data.intervention) {
            
            console.log('📢 Sending notification:', data.intervention.message);
            sendNotification(
              'Stride — Focus Check',
              data.intervention.message
            );
            
            setIntervention(data.intervention);

            setShowIntervention(true);
            setInterventionCount(prev => prev + 1);
            console.log(`🎯 Intervention ${interventionCount + 1}/3 fired (${data.intervention.checkpoint}):`, data.intervention.message);
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('⏱️ Intervention check timed out (took >15s), will retry next minute');
          } else {
            console.error('Error checking intervention:', error);
          }
        }
      }
    };

    // Check every minute (when seconds hit 0)
    if (elapsedSeconds > 0 && elapsedSeconds % 60 === 0) {
      checkForIntervention();
    }
  }, [elapsedSeconds, sessionId, showIntervention, interventionCount]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, (plannedDuration * 60) - elapsedSeconds);
  const remainingFormatted = formatTime(remainingSeconds);
  const progressPercentage = Math.min((elapsedSeconds / (plannedDuration * 60)) * 100, 100);

  const handleEndSession = () => {
    router.push(`/session/end?id=${sessionId}`);
  };

  // TODO: Replace with dynamic quotes from API or database
  const focusQuote = "Focus is the gateway to excellence.";

  return (
    <>
      {/* Main Timer Screen */}
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35]">
        
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(132,204,22,0.1)_0%,_transparent_60%)]" />
        
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl"
            style={{ animation: 'pulse 4s ease-in-out infinite' }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl"
            style={{ animation: 'pulse 4s ease-in-out infinite', animationDelay: '2s' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-12 px-6">
          

          {showNotificationHelp && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto px-4 py-3 bg-amber-500/20 border border-amber-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-amber-200 text-center">
                <strong>Notifications are blocked.</strong> To get focus reminders when you're away from this tab, enable notifications in your browser settings and system preferences.
              </p>
              <button 
                onClick={() => setShowNotificationHelp(false)}
                className="mt-2 w-full text-xs text-amber-300 hover:text-amber-100"
              >
                Dismiss
              </button>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400"></span>
            </span>
            <span className="text-sm text-white/80 font-medium">Focus Session Active</span>
            {notificationPermission === true && (
              <span className="text-xs text-lime-400/60 ml-1">• Notifications on</span>
            )}
            {notificationPermission === false && !isNotificationBlocked() && (
              <button
                onClick={() => requestNotificationPermission().then(setNotificationPermission)}
                className="text-xs text-amber-400 ml-1 hover:text-amber-300 underline underline-offset-2"
              >
                Enable notifications
              </button>
            )}
            {isNotificationBlocked() && (
              <span 
                className="text-xs text-amber-400/80 ml-1 cursor-help"
                title="Notifications are blocked. Check browser and system settings."
              >
                • Notifications blocked
              </span>
            )}
          </div>

          {/* Timer Circle */}
          <div className="relative">

            <div 
              className="absolute rounded-full border border-lime-400/20"
              style={{
                width: '340px',
                height: '340px',
                top: '-10px',
                left: '-10px',
                animation: 'breathe 4s ease-in-out infinite',
              }}
            />
            <div 
              className="absolute rounded-full border border-lime-400/10"
              style={{
                width: '380px',
                height: '380px',
                top: '-30px',
                left: '-30px',
                animation: 'breathe 4s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            />

            {/* Main timer container */}
            <div className="relative w-80 h-80 flex items-center justify-center">

              <svg className="absolute inset-0 w-full h-full -rotate-90">

                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-white/10"
                />
                {/* Progress circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="url(#limeGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - progressPercentage / 100)}`}
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#a3e635" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Timer display */}
              <div className="flex flex-col items-center">
                <div className="text-6xl md:text-7xl font-bold text-white tracking-tight tabular-nums">
                  {formatTime(elapsedSeconds)}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-white/50 text-sm font-medium">
                    {remainingSeconds > 0 ? `${remainingFormatted} remaining` : 'Session Complete!'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Description */}
          <div className="text-center max-w-md">
            <p className="text-xs uppercase tracking-widest text-lime-400/80 font-medium mb-3">
              Currently Focused On
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
              {taskDescription}
            </h1>
          </div>

          <button
            onClick={handleEndSession}
            className="group flex items-center gap-3 px-8 py-3.5 cursor-pointer rounded-full bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30"
          >
            <Square className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
            <span>End Session</span>
          </button>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-lime-400/60" />
            <p className="text-sm text-white/40 italic">
              "{focusQuote}"
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.5;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>

      {/* Modals */}
      {showCheckIn && (
        <CheckInModal
          sessionId={sessionId}
          onClose={() => setShowCheckIn(false)}
        />
      )}

      {showIntervention && intervention && (
        <InterventionNotification
          intervention={{
            message: intervention.message,
            strategy: intervention.strategy,
          }}
          onDismiss={async () => {
            try {
              const response = await fetch('/api/interventions/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  interventionId: intervention.id,
                  action: 'dismissed',
                  responseTimeMs: interventionShownAt ? Date.now() - interventionShownAt : undefined,
                }),
              });
              
              if (!response.ok) {
                console.error('Failed to record intervention response:', response.statusText);
              }
            } catch (error) {
              console.error('Error recording intervention response:', error);
            } finally {
              setShowIntervention(false);
            }
          }}
          onAccept={async () => {
            try {
              const response = await fetch('/api/interventions/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  interventionId: intervention.id,
                  action: 'accepted',
                  responseTimeMs: interventionShownAt ? Date.now() - interventionShownAt : undefined,
                }),
              });
              
              if (!response.ok) {
                console.error('Failed to record intervention response:', response.statusText);
              }
            } catch (error) {
              console.error('Error recording intervention response:', error);
            } finally {
              setShowIntervention(false);
            }
          }}
        />
      )}
    </>
  );
}