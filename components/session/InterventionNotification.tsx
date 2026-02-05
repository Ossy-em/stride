'use client';

import { useState } from 'react';
import { X, Coffee, Zap, ArrowRight, MessageCircle, Sparkles, Brain, Battery, Waves, Volume2, Check } from 'lucide-react';
import BreakOverlay from './BreakOverlay';

type FocusState = 'focused' | 'drifting' | 'lost';
type DriftReason = 'mind_wandering' | 'feeling_stuck' | 'tired' | 'external';
type BreakEffectiveness = 'helped' | 'somewhat' | 'not_really';

interface InterventionNotificationProps {
  intervention: {
    id: string;
    message: string;
    strategy: 'take_break' | 'switch_task' | 'push_through' | 'check_in';
  };
  onDismiss: () => void;
  onAccept: () => void;
  onFeedbackComplete: (data: {
    action: 'accepted' | 'dismissed';
    focusState?: FocusState;
    driftReason?: DriftReason;
    breakEffectiveness?: BreakEffectiveness;
  }) => void;
}

type Step = 'intervention' | 'focus_check' | 'drift_reason' | 'break' | 'break_feedback';

export default function InterventionNotification({
  intervention,
  onDismiss,
  onAccept,
  onFeedbackComplete,
}: InterventionNotificationProps) {
  const [step, setStep] = useState<Step>('intervention');
  const [userAction, setUserAction] = useState<'accepted' | 'dismissed' | null>(null);
  const [focusState, setFocusState] = useState<FocusState | null>(null);

  const getStrategyConfig = () => {
    switch (intervention.strategy) {
      case 'take_break':
        return {
          icon: Coffee,
          gradient: 'from-lime-500 to-lime-600',
          actionText: 'Take Break',
          actionBg: 'bg-lime-400 hover:bg-lime-300',
          borderColor: 'border-lime-200',
        };
      case 'switch_task':
        return {
          icon: ArrowRight,
          gradient: 'from-amber-400 to-amber-500',
          actionText: 'Switch Task',
          actionBg: 'bg-amber-400 hover:bg-amber-300',
          borderColor: 'border-amber-200',
        };
      case 'push_through':
        return {
          icon: Zap,
          gradient: 'from-[#1a3a2f] to-[#143527]',
          actionText: 'Got It',
          actionBg: 'bg-[#1a3a2f] hover:bg-[#0f2a1f] !text-white',
          borderColor: 'border-[#1a3a2f]/20',
        };
      case 'check_in':
        return {
          icon: MessageCircle,
          gradient: 'from-lime-500 to-lime-600',
          actionText: 'Got It',
          actionBg: 'bg-lime-400 hover:bg-lime-300',
          borderColor: 'border-lime-200',
        };
    }
  };

  const config = getStrategyConfig();
  const Icon = config.icon;

  const handleAccept = () => {
    setUserAction('accepted');
    if (intervention.strategy === 'take_break') {
      setStep('break');
    } else {
      setStep('focus_check');
    }
  };

  const handleDismiss = () => {
    setUserAction('dismissed');
    setStep('focus_check');
  };

  const handleFocusState = (state: FocusState) => {
    setFocusState(state);
    if (state === 'focused') {
      completeFeedback({ focusState: state });
    } else {
      setStep('drift_reason');
    }
  };

  const handleDriftReason = (reason: DriftReason) => {
    completeFeedback({ focusState: focusState!, driftReason: reason });
  };

  const handleBreakEffectiveness = (effectiveness: BreakEffectiveness) => {
    completeFeedback({ breakEffectiveness: effectiveness });
  };

  const handleBreakComplete = () => {
    setStep('break_feedback');
  };

  const completeFeedback = (data: {
    focusState?: FocusState;
    driftReason?: DriftReason;
    breakEffectiveness?: BreakEffectiveness;
  }) => {
    onFeedbackComplete({
      action: userAction!,
      ...data,
    });
    if (userAction === 'accepted') {
      onAccept();
    } else {
      onDismiss();
    }
  };

  if (step === 'break') {
    return (
      <BreakOverlay
        strategy={intervention.strategy}
        onComplete={handleBreakComplete}
        duration={30}
      />
    );
  }

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={`bg-white rounded-3xl shadow-2xl border-2 ${config.borderColor} max-w-md mx-auto sm:mx-0 overflow-hidden`}>
        <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Stride</h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-lime-100 rounded-full">
                    <Sparkles className="w-3 h-3 text-lime-600" />
                    <span className="text-xs font-medium text-lime-700">
                      {step === 'intervention' ? 'Focus Check' : 
                       step === 'break_feedback' ? 'Quick Check' : 'Feedback'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Your focus companion</p>
              </div>
            </div>
            
            {step === 'intervention' && (
              <button
                onClick={onDismiss}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {step === 'intervention' && (
            <>
              <p className="text-sm leading-relaxed text-gray-700 mb-5">
                {intervention.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2.5 rounded-full border-2 border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Not Now
                </button>
                <button
                  onClick={handleAccept}
                  className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-[#1a3a2f] transition-all hover:shadow-lg ${config.actionBg}`}
                >
                  {config.actionText}
                </button>
              </div>
            </>
          )}

          {step === 'focus_check' && (
            <>
              <p className="text-sm font-medium text-gray-900 mb-4">
                {userAction === 'dismissed' 
                  ? "No problem. How's your focus right now?"
                  : "Quick check — how's your focus?"}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleFocusState('focused')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-lime-400 hover:bg-lime-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center group-hover:bg-lime-200 transition-colors">
                    <Zap className="w-5 h-5 text-lime-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Focused</p>
                    <p className="text-xs text-gray-500">I'm in the zone</p>
                  </div>
                </button>

                <button
                  onClick={() => handleFocusState('drifting')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Waves className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Drifting</p>
                    <p className="text-xs text-gray-500">Mind's wandering a bit</p>
                  </div>
                </button>

                <button
                  onClick={() => handleFocusState('lost')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Battery className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Lost</p>
                    <p className="text-xs text-gray-500">Can't focus at all</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === 'drift_reason' && (
            <>
              <p className="text-sm font-medium text-gray-900 mb-1">
                What's pulling you away?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                This helps us learn your patterns
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDriftReason('mind_wandering')}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-gray-200 hover:border-lime-400 hover:bg-lime-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-lime-100 transition-colors">
                    <Brain className="w-5 h-5 text-gray-600 group-hover:text-lime-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Mind wandering</p>
                </button>

                <button
                  onClick={() => handleDriftReason('feeling_stuck')}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-gray-200 hover:border-lime-400 hover:bg-lime-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-lime-100 transition-colors">
                    <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-lime-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Feeling stuck</p>
                </button>

                <button
                  onClick={() => handleDriftReason('tired')}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-gray-200 hover:border-lime-400 hover:bg-lime-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-lime-100 transition-colors">
                    <Battery className="w-5 h-5 text-gray-600 group-hover:text-lime-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Too tired</p>
                </button>

                <button
                  onClick={() => handleDriftReason('external')}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-gray-200 hover:border-lime-400 hover:bg-lime-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-lime-100 transition-colors">
                    <Volume2 className="w-5 h-5 text-gray-600 group-hover:text-lime-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-900">Distracted</p>
                </button>
              </div>
            </>
          )}

          {step === 'break_feedback' && (
            <>
              <p className="text-sm font-medium text-gray-900 mb-4">
                Did that break help?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleBreakEffectiveness('helped')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-lime-400 hover:bg-lime-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center group-hover:bg-lime-200 transition-colors">
                    <Check className="w-5 h-5 text-lime-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Yes, feeling refreshed</p>
                </button>

                <button
                  onClick={() => handleBreakEffectiveness('somewhat')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Waves className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Somewhat</p>
                </button>

                <button
                  onClick={() => handleBreakEffectiveness('not_really')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Not really</p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
