'use client';

import { Flame, AlertTriangle, Trophy } from 'lucide-react';

interface StreakBannerProps {
  current: number;
  longest: number;
  isAtRisk: boolean;
}

export default function StreakBanner({ current, longest, isAtRisk }: StreakBannerProps) {
  // Don't show if no streak
  if (current === 0 && longest === 0) {
    return null;
  }

  // Calculate how close to beating record
  const daysToRecord = longest - current;
  const isCloseToRecord = current > 0 && daysToRecord > 0 && daysToRecord <= 3;
  const isBeatRecord = current >= longest && current > 0;

  // At risk state (has streak but no session today)
  if (isAtRisk && current > 0) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-[#d9a441]/10 border border-[#d9a441]/25 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d9a441]/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#b8862f]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#8a6d2b]">
                {current}-day streak at risk!
              </span>
            </div>
            <p className="text-sm text-[#8a6d2b]">
              Complete a session today to keep it going.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Beating or matching record
  if (isBeatRecord) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-[#eef1ed] rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10221c] flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#10221c]">
                {current}-day streak — your best ever!
              </span>
            </div>
            <p className="text-sm text-[#48645b]">
              You're setting new records. Keep it up!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Close to record
  if (isCloseToRecord) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-[#f4f7f2] rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10221c] flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#10221c]">
                {current}-day streak
              </span>
            </div>
            <p className="text-sm text-[#48645b]">
              {daysToRecord === 1
                ? `Just 1 more day to beat your record of ${longest}!`
                : `${daysToRecord} more days to beat your record of ${longest}.`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Normal streak display
  if (current > 0) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-[#f4f7f2] rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10221c] flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-semibold text-[#10221c]">
              {current}-day streak
            </span>
            {longest > current && (
              <p className="text-sm text-[#7c9389]">
                Your longest: {longest} days
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No current streak but has history
  return (
    <div className="flex items-center justify-between p-3.5 bg-[#f4f7f2] rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#eef1ed] flex items-center justify-center">
          <Flame className="w-5 h-5 text-[#7c9389]" />
        </div>
        <div>
          <span className="font-medium text-[#48645b]">Start a new streak</span>
          {longest > 0 && (
            <p className="text-sm text-[#7c9389]">
              Your best was {longest} days. You can beat it!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}