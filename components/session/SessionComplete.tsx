'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Trophy, Flame, Clock, ChevronDown, ChevronUp, Save } from 'lucide-react';

interface SessionCompleteProps {
  sessionId: string;
  taskDescription: string;
  elapsedMinutes: number;
  // Optional: pass streak info if available
  currentStreak?: number;
}

export default function SessionComplete({
  sessionId,
  taskDescription,
  elapsedMinutes,
  currentStreak,
}: SessionCompleteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [formData, setFormData] = useState({
    focusQuality: 7,
    distractionCount: 0,
    outcome: '',
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/sessions/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          actualDuration: elapsedMinutes,
          focusQuality: formData.focusQuality,
          distractionCount: formData.distractionCount,
          outcome: formData.outcome.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to end session');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to save session. Please try again.');
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Discard this session without saving?')) {
      router.push('/dashboard');
    }
  };

  // Format elapsed time nicely
  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  // Get encouragement based on duration
  const getEncouragement = () => {
    if (elapsedMinutes >= 45) return "Deep work achieved. That's serious focus.";
    if (elapsedMinutes >= 25) return "Solid session. You showed up and did the work.";
    if (elapsedMinutes >= 15) return "Every minute counts. Progress is progress.";
    return "You started — that's the hardest part.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2a1f] via-[#143527] to-[#1a4a35] flex items-center justify-center p-4">
      {/* Radial gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(132,204,22,0.1)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header - The Win */}
          <div className="p-8 text-center border-b border-gray-100">
            {/* Success Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-lime-600" />
            </div>

            {/* Main Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h1>
            <p className="text-gray-500">{getEncouragement()}</p>

            {/* Duration Badge */}
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-50 rounded-full">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {formatDuration(elapsedMinutes)} of focus
              </span>
            </div>
          </div>

          {/* Task Summary */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">You worked on</p>
            <p className="text-gray-900 font-medium">{taskDescription}</p>
          </div>

          {/* Streak (if applicable) */}
          {currentStreak && currentStreak > 0 && (
            <div className="px-8 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">🔥 {currentStreak + 1}-day streak!</p>
                <p className="text-sm text-amber-700">You're building momentum.</p>
              </div>
            </div>
          )}

          {/* Quick Rating */}
          <div className="p-8">
            <p className="text-sm font-medium text-gray-700 mb-3">How was your focus?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, focusQuality: num })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.focusQuality === num
                      ? 'bg-lime-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Distracted</span>
              <span>Deep focus</span>
            </div>
          </div>

          {/* Optional Details (Collapsible) */}
          <div className="px-8 pb-4">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              {showDetails ? 'Hide details' : 'Add more details (optional)'}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                {/* Distraction count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many times did you get distracted?
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500"
                    value={formData.distractionCount}
                    onChange={(e) =>
                      setFormData({ ...formData, distractionCount: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                    max={99}
                  />
                </div>

                {/* Outcome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What did you accomplish?
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 resize-none"
                    rows={3}
                    placeholder="Quick notes on what you got done..."
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    maxLength={500}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-8 pt-0 flex gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#1a3a2f] border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & Done
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}