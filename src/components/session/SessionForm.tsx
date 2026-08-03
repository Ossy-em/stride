'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import UpgradePrompt from '@/components/shared/UpgradePrompt';

type TaskType = 'writing' | 'reading' | 'coding';

export default function SessionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    taskDescription: string;
    taskType: TaskType;
    plannedDuration: number | '';
  }>({
    taskDescription: '',
    taskType: 'coding' as TaskType,
    plannedDuration: 25,
  });

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'session_limit' | 'duration_limit'>('session_limit');
  const [upgradeContext, setUpgradeContext] = useState<any>(null);
  const [planInfo, setPlanInfo] = useState<{ plan: string; sessionsToday: number; dailyLimit: number } | null>(null);

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const tz = encodeURIComponent(userTimezone);
    fetch(`/api/user/plan?tz=${tz}`)
      .then(res => res.json())
      .then(data => {
        setPlanInfo({
          plan: data.plan,
          sessionsToday: data.sessions?.todayCount || 0,
          dailyLimit: data.sessions?.dailyLimit || -1,
        });
      })
      .catch(() => {});
  }, [userTimezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plannedDuration: formData.plannedDuration || 25,
          timezone: userTimezone,
        }),
      });

      const data = await response.json();

      if (response.status === 403 && data.upgrade) {
        if (data.sessionsToday !== undefined) {
          setUpgradeReason('session_limit');
          setUpgradeContext({ sessionsUsed: data.sessionsToday, sessionLimit: data.limit });
        } else if (data.maxAllowed !== undefined) {
          setUpgradeReason('duration_limit');
          setUpgradeContext({ maxDuration: data.maxAllowed });
        }
        setShowUpgrade(true);
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error(data.error || 'Failed to start session');

      router.push(`/session/active?id=${data.sessionId}`);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Please try again.');
      setLoading(false);
    }
  };

  const taskTypes = [
    { value: 'writing', label: 'Writing' },
    { value: 'reading', label: 'Learning' },
    { value: 'coding', label: 'Development' },
  ];

  const durationPresets = [15, 25, 45, 60];

  const showSessionCount = planInfo && planInfo.plan === 'free' && planInfo.dailyLimit > 0;
  const sessionsRemaining = planInfo ? planInfo.dailyLimit - planInfo.sessionsToday : 0;

  return (
    <div className="min-h-screen bg-[#f7faf8] flex flex-col">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 pt-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#7c9389] hover:text-[#10221c] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-center">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#10221c] tracking-tight mb-1">Start a focus session</h1>
          <p className="text-[14px] text-[#7c9389]">What do you want to accomplish?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="task" className="block text-[13px] font-medium text-[#48645b] mb-1.5">
              What will you work on?
            </label>
            <input
              id="task"
              type="text"
              className="w-full px-4 py-3 bg-white rounded-xl text-[15px] text-[#10221c] placeholder-[#a3b3ab] border border-[#dfe4e0] focus:outline-none focus:border-[#8aa89c] focus:ring-2 focus:ring-[#8aa89c]/20 transition-all"
              placeholder="e.g., Finish chapter 3, Build login feature, Draft proposal..."
              value={formData.taskDescription}
              onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
              required
              maxLength={200}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#48645b] mb-2">Task type</label>
            <div className="grid grid-cols-3 gap-2.5">
              {taskTypes.map(({ value, label }) => {
                const active = formData.taskType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, taskType: value as TaskType })}
                    className={`py-3 rounded-xl text-[14px] font-medium transition-all ${
                      active
                        ? 'bg-[#10221c] text-[#f0f0ec]'
                        : 'bg-white text-[#48645b] border border-[#dfe4e0] hover:border-[#cbd8d1]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#48645b] mb-2">Focus duration</label>
            <div className="flex flex-wrap gap-2">
              {durationPresets.map((mins) => {
                const active = formData.plannedDuration === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setFormData({ ...formData, plannedDuration: mins })}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                      active
                        ? 'bg-[#10221c] text-[#f0f0ec]'
                        : 'bg-white text-[#48645b] border border-[#dfe4e0] hover:border-[#cbd8d1]'
                    }`}
                  >
                    {mins} min
                  </button>
                );
              })}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#dfe4e0]">
                <input
                  type="number"
                  className="w-10 bg-transparent text-center text-[13px] font-medium text-[#10221c] focus:outline-none"
                  value={formData.plannedDuration}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      plannedDuration: val === '' ? '' : parseInt(val),
                    });
                  }}
                  onBlur={() => {
                    if (formData.plannedDuration === '' || (formData.plannedDuration as number) < 3) {
                      setFormData({ ...formData, plannedDuration: 25 });
                    } else if ((formData.plannedDuration as number) > 180) {
                      setFormData({ ...formData, plannedDuration: 180 });
                    }
                  }}
                  min={7}
                  max={180}
                />
                <span className="text-[13px] text-[#7c9389]">min</span>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-[#7c9389]">
              {planInfo?.plan === 'free'
                ? 'Free plan: up to 30 minutes per session.'
                : 'Tip: start with 25 minutes. You can always extend.'}
            </p>
          </div>

          {showSessionCount && (
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${
              sessionsRemaining <= 1
                ? 'bg-[#d9a441]/10 border border-[#d9a441]/25'
                : 'bg-[#f4f7f2]'
            }`}>
              <span className="text-[13px] text-[#48645b]">Sessions today</span>
              <span className={`text-[13px] font-medium ${
                sessionsRemaining <= 1 ? 'text-[#b8862f]' : 'text-[#10221c]'
              }`}>
                {planInfo!.sessionsToday}/{planInfo!.dailyLimit} used
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.taskDescription.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#10221c] text-[#f0f0ec] text-[15px] font-medium rounded-full hover:bg-[#1a3229] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#f0f0ec] border-t-transparent rounded-full animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <span>Begin focus session</span>
            )}
          </button>
        </form>

        <p className="mt-5 text-[12px] leading-relaxed text-[#7c9389]">
          <span className="font-medium text-[#48645b]">Quick tip:</span> be specific about your task.
          "Write intro paragraph for blog post" works better than "Work on blog."
        </p>
      </main>

      {showUpgrade && (
        <UpgradePrompt
          reason={upgradeReason}
          onClose={() => setShowUpgrade(false)}
          context={upgradeContext}
        />
      )}
    </div>
  );
}