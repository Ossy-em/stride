'use client';

import { X, Coffee, Zap, ArrowRight, MessageCircle } from 'lucide-react';

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
          color: 'teal',
          actionText: 'Take Break',
        };
      case 'switch_task':
        return {
          icon: ArrowRight,
          color: 'amber',
          actionText: 'Switch Task',
        };
      case 'push_through':
        return {
          icon: Zap,
          color: 'coral',
          actionText: 'Keep Going',
        };
      case 'check_in':
        return {
          icon: MessageCircle,
          color: 'teal',
          actionText: 'Got It',
        };
    }
  };

  const config = getStrategyConfig();
  const Icon = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="card max-w-md shadow-2xl border-2 border-teal-200 dark:border-teal-800">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Stride Check-In</h3>
              <p className="text-xs text-secondary">Focus Assistant</p>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
          {intervention.message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-2.5 rounded-full border-2 border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all"
          >
            {config.actionText}
          </button>
        </div>
      </div>
    </div>
  );
}