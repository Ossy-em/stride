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
        return <Sun className="w-5 h-5 text-[#7c9389]" />;
      case 'afternoon':
        return <CloudSun className="w-5 h-5 text-[#7c9389]" />;
      case 'evening':
        return <Moon className="w-5 h-5 text-[#7c9389]" />;
      case 'night':
        return <Stars className="w-5 h-5 text-[#7c9389]" />;
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
    <div className="space-y-2">
      {/* Time-based greeting */}
      <div className="flex items-center gap-2 text-[#7c9389]">
        {getTimeIcon()}
        <span className="text-sm font-medium">
          {getGreetingText()}
          {firstName && `, ${firstName}`}
        </span>
      </div>

      {/* Main message */}
      <div>
        <h1 className="text-[22px] sm:text-2xl font-bold text-[#10221c] tracking-tight leading-tight">
          {message}
        </h1>
        {subMessage && (
          <p className="mt-1 text-[#7c9389] text-[15px]">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
}