'use client';

import { X, Coffee, Zap, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';

interface InterventionNotificationProps {
  intervention: {
    message: string;
    strategy: 'take_break' | 'switch_task' | 'push_through' | 'check_in';
  };
  onDismiss: () => void;
  onAccept: () => void;
}

export default function InterventionNotification({
  intervention,
  onDismiss,
  onAccept,
}: InterventionNotificationProps) {
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
          actionText: 'Keep Going',
          actionBg: 'bg-[#1a3a2f] hover:bg-[#0f2a1f] text-white',
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

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className={`bg-white rounded-3xl shadow-2xl border-2 ${config.borderColor} max-w-md mx-auto sm:mx-0 overflow-hidden`}>
        {/* Subtle gradient top accent */}
        <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
        
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Stride Check-In</h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-lime-100 rounded-full">
                    <Sparkles className="w-3 h-3 text-lime-600" />
                    <span className="text-xs font-medium text-lime-700">AI</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Focus Assistant</p>
              </div>
            </div>
            
            <button
              onClick={onDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message */}
          <p className="text-sm leading-relaxed text-gray-700 mb-5">
            {intervention.message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2.5 rounded-full border-2 border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Not Now
            </button>
            <button
              onClick={onAccept}
              className={`flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-[#1a3a2f] transition-all hover:shadow-lg ${config.actionBg}`}
            >
              {config.actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}