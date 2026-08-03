'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellOff } from 'lucide-react';
import CheckInModal from './CheckInModal';
import InterventionNotification from './InterventionNotification';
import FirstSessionOverlay from './FirstSessionOverlay';
import { setupPushNotifications, type PushSetupResult } from '@/lib/push-subscription';
import Button from '@/components/ui/Button';

interface ActiveTimerProps {
  sessionId: string;
  taskDescription: string;
  plannedDuration: number;
  startedAt: string;
}

const DEMO_INTERVENTION = {
  id: 'demo-intervention',
  message: "This is how Stride checks in with you. We noticed you're in your first session. Respond to these nudges and we'll learn your focus patterns over time.",
  strategy: 'check_in' as const,
};

export default function ActiveTimer({ sessionId, taskDescription, plannedDuration, startedAt }: ActiveTimerProps) {
  const router = useRouter();
  
  const [sessionStartTime] = useState(() => {
    const dbTime = new Date(startedAt.endsWith('Z') ? startedAt : startedAt + 'Z').getTime();
    const now = Date.now();
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
  const [isPaused, setIsPaused] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [isFirstSession, setIsFirstSession] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const demoInterventionFired = useRef(false);

  const CHECK_IN_INTERVAL = 20 * 60;
  const lastInterventionCheck = useRef(0);
  const shownInterventionIds = useRef<Set<string>>(new Set());


  useEffect(() => {
    fetch('/api/user/plan')
      .then(res => res.json())
      .then(data => setUserPlan(data.plan))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const checkFirstSession = async () => {
      try {
        const res = await fetch('/api/sessions/count');
        if (res.ok) {
          const data = await res.json();

          if (data.count <= 1) {
            setIsFirstSession(true);
            setShowOnboarding(true);
          }
        }
      } catch (e) {

      }
    };
    checkFirstSession();
  }, []);

  //  Check if session was already paused  
  useEffect(() => {
    const checkSessionState = async () => {
      try {
        const res = await fetch(`/api/sessions/status?id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.paused_at) {
            setIsPaused(true);
            setPausedAt(new Date(data.paused_at).getTime());
          }
          if (data.total_paused_ms) {
            setTotalPausedMs(data.total_paused_ms);
          }
        }
      } catch (e) {
      }
    };
    checkSessionState();
  }, [sessionId]);

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

  const checkPendingInterventions = useCallback(async () => {
    if (showIntervention || isPaused) return;

    try {
      const response = await fetch(`/api/interventions/pending?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.pending && data.intervention) {
        showInterventionIfNew(data.intervention);
      }
    } catch (error) {
      console.error('Error checking pending interventions:', error);
    }
  }, [sessionId, showIntervention, showInterventionIfNew, isPaused]);

  useEffect(() => {
    setupPushNotifications().then((status) => {
      setPushStatus(status);
      if (status.supported && !status.subscribed && status.permission === 'denied') {
        setShowNotificationHelp(true);
      }
    });
  }, []);

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) return;

      const now = Date.now();
      const effectiveElapsed = now - sessionStartTime - totalPausedMs;
      const elapsed = Math.max(0, Math.floor(effectiveElapsed / 1000));
      setElapsedSeconds(elapsed);

      if (elapsed - lastCheckInTime >= CHECK_IN_INTERVAL && elapsed > 0) {
        setShowCheckIn(true);
        setLastCheckInTime(elapsed);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime, lastCheckInTime, isPaused, totalPausedMs]);

  useEffect(() => {
    if (isPaused) return;

    const checkForIntervention = async () => {
      const elapsedMins = Math.floor(elapsedSeconds / 60);
      if (interventionCount >= 3 || elapsedMins < 1 || showIntervention) return;
      if (elapsedMins <= lastInterventionCheck.current) return;
      lastInterventionCheck.current = elapsedMins;

      if (isFirstSession && elapsedMins === 2 && !demoInterventionFired.current) {
        demoInterventionFired.current = true;
        showInterventionIfNew(DEMO_INTERVENTION);
        return;
      }

      if (isFirstSession && elapsedMins === 2) return;

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
  }, [elapsedSeconds, sessionId, showIntervention, interventionCount, showInterventionIfNew, isPaused, isFirstSession]);

  const handlePauseResume = async () => {
    setPauseLoading(true);
    try {
      const action = isPaused ? 'resume' : 'pause';
      const response = await fetch('/api/sessions/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action }),
      });

      const data = await response.json();

      if (response.status === 403 && data.upgrade) {
        return;
      }

      if (!response.ok) {
        console.error('Pause/resume error:', data.error);
        return;
      }

      if (action === 'pause') {
        setIsPaused(true);
        setPausedAt(Date.now());
      } else {
        if (pausedAt) {
          const pauseDuration = Date.now() - pausedAt;
          setTotalPausedMs(prev => prev + pauseDuration);
        }
        if (data.total_paused_ms !== undefined) {
          setTotalPausedMs(data.total_paused_ms);
        }
        setIsPaused(false);
        setPausedAt(null);
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
    } finally {
      setPauseLoading(false);
    }
  };

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
    if (intervention?.id === 'demo-intervention') return;

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

  const canPause = userPlan === 'premium';

  return (
    <>

      {showOnboarding && (
        <FirstSessionOverlay onDismiss={() => setShowOnboarding(false)} />
      )}

      <div className="min-h-screen relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,_rgba(124,147,137,0.18)_0%,_transparent_62%)]" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8aa89c]/8 rounded-full blur-3xl" style={{ animation: isPaused ? 'none' : 'pulse 4s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8aa89c]/8 rounded-full blur-3xl" style={{ animation: isPaused ? 'none' : 'pulse 4s ease-in-out infinite', animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-12 px-6">
          {showNotificationHelp && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto px-4 py-3 bg-[#d9a441]/12 border border-[#d9a441]/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-[#8a6d2b] text-center">
                <strong>Notifications are blocked.</strong> Enable them in browser settings so Stride can reach you even when you switch tabs.
              </p>
              <div className="flex gap-2 mt-2">
                <button onClick={handleRetryNotifications} className="flex-1 text-xs text-[#8a6d2b] hover:text-[#6a5320] py-1 border border-[#d9a441]/30 rounded-lg">
                  Try again
                </button>
                <button onClick={() => setShowNotificationHelp(false)} className="flex-1 text-xs text-[#8a6d2b] hover:text-[#6a5320] py-1">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f7f2]">
            <span className="relative flex h-2 w-2">
              {isPaused ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c9389]"></span>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2f5648] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2f5648]"></span>
                </>
              )}
            </span>
            <span className="text-sm text-[#48645b] font-medium">
              {isPaused ? 'Session Paused' : 'Focus Session Active'}
            </span>
            <span className="flex items-center gap-1 ml-1">
              <NotificationIcon className={`w-3 h-3 ${pushStatus.subscribed ? 'text-[#7c9389]' : 'text-[#d9a441]'}`} />
              <span className={`text-xs ${pushStatus.subscribed ? 'text-[#7c9389]' : 'text-[#d9a441]'}`}>
                {notificationLabel}
              </span>
            </span>
          </div>

          <div className="relative">
            <div
              className="absolute rounded-full border border-[#8aa89c]/25"
              style={{
                width: '340px', height: '340px', top: '-10px', left: '-10px',
                animation: isPaused ? 'none' : 'breathe 4s ease-in-out infinite',
              }}
            />
            <div
              className="absolute rounded-full border border-[#8aa89c]/15"
              style={{
                width: '380px', height: '380px', top: '-30px', left: '-30px',
                animation: isPaused ? 'none' : 'breathe 4s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            />
            <div className="relative w-80 h-80 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="160" cy="160" r="140" stroke="currentColor" strokeWidth="4" fill="none" className="text-[#dfe4e0]" />
                <circle
                  cx="160" cy="160" r="140"
                  stroke={isPaused ? 'rgba(124, 147, 137, 0.45)' : 'url(#strideGradient)'}
                  strokeWidth="4" fill="none" strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  strokeDasharray={`${2 * Math.PI * 140}`}
                  strokeDashoffset={`${2 * Math.PI * 140 * (1 - progressPercentage / 100)}`}
                />
                <defs>
                  <linearGradient id="strideGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10221c" />
                    <stop offset="100%" stopColor="#7c9389" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col items-center">
                <div className={`text-6xl md:text-7xl font-bold tracking-tight tabular-nums ${isPaused ? 'text-[#7c9389]' : 'text-[#10221c]'}`}>
                  {formatTime(elapsedSeconds)}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[#7c9389] text-sm font-medium">
                    {isPaused
                      ? 'Paused'
                      : remainingSeconds > 0
                        ? `${formatTime(remainingSeconds)} remaining`
                        : 'Session Complete!'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center max-w-md">
            <p className="text-sm text-[#7c9389] font-medium mb-3">Currently focused on</p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#10221c] tracking-tight leading-tight">{taskDescription}</h1>
          </div>

          <div className="flex items-center gap-3">
            {canPause && (
              <Button
                variant="outline"
                onClick={handlePauseResume}
                loading={pauseLoading}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}

            <Button variant="solid" onClick={handleEndSession}>
              End session
            </Button>
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