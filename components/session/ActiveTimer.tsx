'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Square, Sparkles, Bell, BellOff } from 'lucide-react';
import CheckInModal from './CheckInModal';
import InterventionNotification from './InterventionNotification';
import { setupPushNotifications, type PushSetupResult } from '@/lib/push-subscription';

interface ActiveTimerProps {
  sessionId: string;
  taskDescription: string;
  plannedDuration: number;
  startedAt: string;
}

export default function ActiveTimer({ sessionId, taskDescription, plannedDuration, startedAt }: ActiveTimerProps) {
  const router = useRouter();
  
 const [sessionStartTime] = useState(() => {
const dbTime = new Date(startedAt.endsWith('Z') ? startedAt : startedAt + 'Z').getTime();
  const now = Date.now();
  // If the DB time is in the future (timezone issue) or way too far in the past, fallback
  if (dbTime > now || now - dbTime > plannedDuration * 60 * 1000 * 3) {
    return now;
  }
  return dbTime;
});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState(0);
  const [intervention, setIntervention] = useState<any>(null);
  const [showIntervention, setShowIntervention] = useState(false);
  const [interventionCount, setInterventionCount] = useState(0);
  const [interventionShownAt, setInterventionShownAt] = useState<number | null>(null);
  const [pushStatus, setPushStatus] = useState<PushSetupResult>({
    supported: false, subscribed: false, permission: null,
  });
  const [showNotificationHelp, setShowNotificationHelp] = useState(false);

  const CHECK_IN_INTERVAL = 20 * 60;
  const lastInterventionCheck = useRef(0);
  const shownInterventionIds = useRef<Set<string>>(new Set());

  // Helper to show an intervention only if we haven't shown it before
  const showInterventionIfNew = useCallback((interventionData: any) => {
    if (!interventionData?.id) return false;
    if (shownInterventionIds.current.has(interventionData.id)) return false;
    if (showIntervention) return false;

    shownInterventionIds.current.add(interventionData.id);
    setIntervention(interventionData);
    setShowIntervention(true);
    setInterventionShownAt(Date.now());
    setInterventionCount(prev => prev + 1);
    return true;
  }, [showIntervention]);

  // Check for pending interventions (sent while app was backgrounded)
  const checkPendingInterventions = useCallback(async () => {
    if (showIntervention) return;

    try {
      const response = await fetch(`/api/interventions/pending?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.pending && data.intervention) {
        showInterventionIfNew(data.intervention);
      }
    } catch (error) {
      console.error('Error checking pending interventions:', error);
    }
  }, [sessionId, showIntervention, showInterventionIfNew]);

  // Setup push notifications on mount
  useEffect(() => {
    setupPushNotifications().then((status) => {
      setPushStatus(status);
      if (status.supported && !status.subscribed && status.permission === 'denied') {
        setShowNotificationHelp(true);
      }
    });
  }, []);

  // Check for pending interventions on mount and when app regains focus
  useEffect(() => {
    checkPendingInterventions();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPendingInterventions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkPendingInterventions]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      setElapsedSeconds(elapsed);
      if (elapsed - lastCheckInTime >= CHECK_IN_INTERVAL && elapsed > 0) {
        setShowCheckIn(true);
        setLastCheckInTime(elapsed);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime, lastCheckInTime]);

  // Intervention check - runs every minute (backup for when tab is active)
  useEffect(() => {
    const checkForIntervention = async () => {
      const elapsedMins = Math.floor(elapsedSeconds / 60);
      if (interventionCount >= 3 || elapsedMins < 1 || showIntervention) return;
      if (elapsedMins <= lastInterventionCheck.current) return;
      lastInterventionCheck.current = elapsedMins;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const response = await fetch('/api/interventions/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, elapsedMinutes: elapsedMins }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.needed && data.intervention) {
          showInterventionIfNew(data.intervention);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error checking intervention:', error);
        }
      }
    };

    if (elapsedSeconds > 0 && elapsedSeconds % 60 === 0) {
      checkForIntervention();
    }
  }, [elapsedSeconds, sessionId, showIntervention, interventionCount, showInterventionIfNew]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, (plannedDuration * 60) - elapsedSeconds);
  const progressPercentage = Math.min((elapsedSeconds / (plannedDuration * 60)) * 100, 100);

  const handleEndSession = () => router.push(`/session/end?id=${sessionId}`);

  const handleRetryNotifications = async () => {
    const status = await setupPushNotifications();
    setPushStatus(status);
    if (status.subscribed) setShowNotificationHelp(false);
  };

  const handleFeedbackComplete = async (data: {
    action: 'accepted' | 'dismissed';
    focusState?: 'focused' | 'drifting' | 'lost';
    driftReason?: 'mind_wandering' | 'feeling_stuck' | 'tired' | 'external';
    breakEffectiveness?: 'helped' | 'somewhat' | 'not_really';
  }) => {
    try {
      const responseTimeMs = interventionShownAt ? Date.now() - interventionShownAt : undefined;
      await fetch('/api/interventions/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interventionId: intervention.id,
          action: data.action,
          focusState: data.focusState,
          driftReason: data.driftReason,
          breakEffectiveness: data.breakEffectiveness,
          responseTimeMs,
        }),
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  const NotificationIcon = pushStatus.subscribed ? Bell : BellOff;
  const notificationLabel = pushStatus.subscribed
    ? 'Notifications on'
    : pushStatus.permission === 'denied'
    ? 'Notifications blocked'
    : 'Notifications off';

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(132,204,22,0.1)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite', animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-12 px-6">
          {showNotificationHelp && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto px-4 py-3 bg-amber-500/20 border border-amber-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-amber-200 text-center">
                <strong>Notifications are blocked.</strong> Enable them in browser settings so Stride can reach you even when you switch tabs.
              </p>
              <div className="flex gap-2 mt-2">
                <button onClick={handleRetryNotifications} className="flex-1 text-xs text-amber-300 hover:text-amber-100 py-1 border border-amber-500/30 rounded-lg">
                  Try again
                </button>
                <button onClick={() => setShowNotificationHelp(false)} className="flex-1 text-xs text-amber-300 hover:text-amber-100 py-1">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400"></span>
            </span>
            <span className="text-sm text-white/80 font-medium">Focus Session Active</span>
            <span className="flex items-center gap-1 ml-1">
              <NotificationIcon className={`w-3 h-3 ${pushStatus.subscribed ? 'text-lime-400/60' : 'text-amber-400/60'}`} />
              <span className={`text-xs ${pushStatus.subscribed ? 'text-lime-400/60' : 'text-amber-400/60'}`}>
                {notificationLabel}
              </span>
            </span>
          </div>

          <div className="relative">
            <div className="absolute rounded-full border border-lime-400/20" style={{ width: '340px', height: '340px', top: '-10px', left: '-10px', animation: 'breathe 4s ease-in-out infinite' }} />
            <div className="absolute rounded-full border border-lime-400/10" style={{ width: '380px', height: '380px', top: '-30px', left: '-30px', animation: 'breathe 4s ease-in-out infinite', animationDelay: '0.5s' }} />
            <div className="relative w-80 h-80 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" />
                <circle cx="160" cy="160" r="140" stroke="url(#limeGradient)" strokeWidth="4" fill="none" strokeLinecap="round" className="transition-all duration-1000 ease-out" strokeDasharray={`${2 * Math.PI * 140}`} strokeDashoffset={`${2 * Math.PI * 140 * (1 - progressPercentage / 100)}`} />
                <defs>
                  <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#a3e635" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col items-center">
                <div className="text-6xl md:text-7xl font-bold text-white tracking-tight tabular-nums">{formatTime(elapsedSeconds)}</div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-white/50 text-sm font-medium">{remainingSeconds > 0 ? `${formatTime(remainingSeconds)} remaining` : 'Session Complete!'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center max-w-md">
            <p className="text-xs uppercase tracking-widest text-lime-400/80 font-medium mb-3">Currently Focused On</p>
            <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight">{taskDescription}</h1>
          </div>

          <button onClick={handleEndSession} className="group flex items-center gap-3 px-8 py-3.5 cursor-pointer rounded-full bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/30">
            <Square className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
            <span>End Session</span>
          </button>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-lime-400/60" />
            <p className="text-sm text-white/40 italic">"Focus is the gateway to excellence."</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.5; } }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
      `}</style>

      {showCheckIn && <CheckInModal sessionId={sessionId} onClose={() => setShowCheckIn(false)} />}
      
      {showIntervention && intervention && (
        <InterventionNotification
          intervention={{ id: intervention.id, message: intervention.message, strategy: intervention.strategy }}
          onFeedbackComplete={handleFeedbackComplete}
          onDismiss={() => setShowIntervention(false)}
          onAccept={() => setShowIntervention(false)}
        />
      )}
    </>
  );
}