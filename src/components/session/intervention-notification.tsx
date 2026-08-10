'use client';

import { useState } from 'react';
import { X, Coffee, Zap, ArrowRight, MessageCircle, Sparkles, Brain, Battery, Waves, Volume2, Check } from 'lucide-react';
import BreakOverlay from './break-overlay';

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
          gradient: 'from-[#2f5648] to-[#10221c]',
          actionText: 'Take Break',
          actionBg: 'bg-[#10221c] hover:bg-[#1a3229] !text-[#f0f0ec]',
          borderColor: 'border-[#dfe4e0]',
        };
      case 'switch_task':
        return {
          icon: ArrowRight,
          gradient: 'from-[#2f5648] to-[#10221c]',
          actionText: 'Switch Task',
          actionBg: 'bg-[#10221c] hover:bg-[#1a3229] !text-[#f0f0ec]',
          borderColor: 'border-[#dfe4e0]',
        };
      case 'push_through':
        return {
          icon: Zap,
          gradient: 'from-[#2f5648] to-[#10221c]',
          actionText: 'Got It',
          actionBg: 'bg-[#10221c] hover:bg-[#1a3229] !text-[#f0f0ec]',
          borderColor: 'border-[#dfe4e0]',
        };
      case 'check_in':
        return {
          icon: MessageCircle,
          gradient: 'from-[#2f5648] to-[#10221c]',
          actionText: 'Got It',
          actionBg: 'bg-[#10221c] hover:bg-[#1a3229] !text-[#f0f0ec]',
          borderColor: 'border-[#dfe4e0]',
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

        
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#10221c] text-sm">Stride</h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[#eef1ed] rounded-full">
                    <Sparkles className="w-3 h-3 text-[#2f5648]" />
                    <span className="text-xs font-medium text-[#2f5648]">
                      {step === 'intervention' ? 'Focus Check' : 
                       step === 'break_feedback' ? 'Quick Check' : 'Feedback'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#7c9389]">Your focus companion</p>
              </div>
            </div>
            
            {step === 'intervention' && (
              <button
                onClick={onDismiss}
                className="p-1.5 text-[#7c9389] hover:text-[#48645b] hover:bg-[#eef1ed] rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {step === 'intervention' && (
            <>
              <p className="text-sm leading-relaxed text-[#48645b] mb-5">
                {intervention.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#dfe4e0] text-sm font-medium text-[#48645b] hover:bg-[#f7faf8] hover:border-[#cbd8d1] transition-all"
                >
                  Not Now
                </button>
                <button
                  onClick={handleAccept}
                  className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-[#f0f0ec] transition-all hover:shadow-lg ${config.actionBg}`}
                >
                  {config.actionText}
                </button>
              </div>
            </>
          )}

          {step === 'focus_check' && (
            <>
              <p className="text-sm font-medium text-[#10221c] mb-4">
                {userAction === 'dismissed' 
                  ? "No problem. How's your focus right now?"
                  : "Quick check — how's your focus?"}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleFocusState('focused')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#8aa89c] hover:bg-[#eef1ed] transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#dfe4e0] transition-colors">
                    <Zap className="w-5 h-5 text-[#10221c]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#10221c]">Focused</p>
                    <p className="text-xs text-[#7c9389]">I'm in the zone</p>
                  </div>
                </button>

                <button
                  onClick={() => handleFocusState('drifting')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#b4c5bd] hover:bg-[#f7faf8] transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#dfe4e0] transition-colors">
                    <Waves className="w-5 h-5 text-[#7c9389]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#10221c]">Drifting</p>
                    <p className="text-xs text-[#7c9389]">Mind's wandering a bit</p>
                  </div>
                </button>

                <button
                  onClick={() => handleFocusState('lost')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#dfe4e0] hover:bg-[#f7faf8] transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#dfe4e0] transition-colors">
                    <Battery className="w-5 h-5 text-[#b4c5bd]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#10221c]">Lost</p>
                    <p className="text-xs text-[#7c9389]">Can't focus at all</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {step === 'drift_reason' && (
            <>
              <p className="text-sm font-medium text-[#10221c] mb-1">
                What's pulling you away?
              </p>
              <p className="text-xs text-[#7c9389] mb-4">
                This helps us learn your patterns
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDriftReason('mind_wandering')}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#8aa89c] hover:bg-[#eef1ed] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#eef1ed] transition-colors">
                    <Brain className="w-5 h-5 text-[#48645b] group-hover:text-[#10221c]" />
                  </div>
                  <p className="text-xs font-medium text-[#10221c]">Mind wandering</p>
                </button>

                <button
                  onClick={() => handleDriftReason('feeling_stuck')}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#8aa89c] hover:bg-[#eef1ed] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#eef1ed] transition-colors">
                    <MessageCircle className="w-5 h-5 text-[#48645b] group-hover:text-[#10221c]" />
                  </div>
                  <p className="text-xs font-medium text-[#10221c]">Feeling stuck</p>
                </button>

                <button
                  onClick={() => handleDriftReason('tired')}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#8aa89c] hover:bg-[#eef1ed] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#eef1ed] transition-colors">
                    <Battery className="w-5 h-5 text-[#48645b] group-hover:text-[#10221c]" />
                  </div>
                  <p className="text-xs font-medium text-[#10221c]">Too tired</p>
                </button>

                <button
                  onClick={() => handleDriftReason('external')}
                  className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#8aa89c] hover:bg-[#eef1ed] transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#eef1ed] transition-colors">
                    <Volume2 className="w-5 h-5 text-[#48645b] group-hover:text-[#10221c]" />
                  </div>
                  <p className="text-xs font-medium text-[#10221c]">Distracted</p>
                </button>
              </div>
            </>
          )}

          {step === 'break_feedback' && (
            <>
              <p className="text-sm font-medium text-[#10221c] mb-4">
                Did that break help?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleBreakEffectiveness('helped')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#8aa89c] hover:bg-[#eef1ed] transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#dfe4e0] transition-colors">
                    <Check className="w-5 h-5 text-[#10221c]" />
                  </div>
                  <p className="text-sm font-medium text-[#10221c]">Yes, feeling refreshed</p>
                </button>

                <button
                  onClick={() => handleBreakEffectiveness('somewhat')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#b4c5bd] hover:bg-[#f7faf8] transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#dfe4e0] transition-colors">
                    <Waves className="w-5 h-5 text-[#7c9389]" />
                  </div>
                  <p className="text-sm font-medium text-[#10221c]">Somewhat</p>
                </button>

                <button
                  onClick={() => handleBreakEffectiveness('not_really')}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-[#dfe4e0] hover:border-[#cbd8d1] hover:bg-[#f7faf8] transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center group-hover:bg-[#e2e8e4] transition-colors">
                    <X className="w-5 h-5 text-[#7c9389]" />
                  </div>
                  <p className="text-sm font-medium text-[#10221c]">Not really</p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}