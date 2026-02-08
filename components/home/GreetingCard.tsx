'use client';

import { Sun, Moon, CloudSun, Stars } from 'lucide-react';

interface GreetingCardProps {
  firstName: string | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  message: string;
  subMessage: string | null;
}

export default function GreetingCard({
  firstName,
  timeOfDay,
  message,
  subMessage,
}: GreetingCardProps) {
  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'afternoon':
        return <CloudSun className="w-5 h-5 text-orange-400" />;
      case 'evening':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'night':
        return <Stars className="w-5 h-5 text-indigo-300" />;
    }
  };

  const getGreetingText = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'Good morning';
      case 'afternoon':
        return 'Good afternoon';
      case 'evening':
        return 'Good evening';
      case 'night':
        return 'Hey there';
    }
  };

  return (
    <div className="space-y-4">
      {/* Time-based greeting */}
      <div className="flex items-center gap-2 text-gray-500">
        {getTimeIcon()}
        <span className="text-sm font-medium">
          {getGreetingText()}
          {firstName && `, ${firstName}`}
        </span>
      </div>

      {/* Main message */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          {message}
        </h1>
        {subMessage && (
          <p className="mt-2 text-gray-500 text-base sm:text-lg">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
}