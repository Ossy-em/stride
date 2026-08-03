'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Trophy, Flame, Clock, ChevronDown, ChevronUp, Save, MessageSquare } from 'lucide-react';

interface SessionCompleteProps {
  sessionId: string;
  taskDescription: string;
  elapsedMinutes: number;
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
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
      
      // Show feedback prompt instead of immediately redirecting
      setShowFeedback(true);
      setLoading(false);
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to save session. Please try again.');
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackMessage.trim()) {
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: feedbackMessage.trim(),
            type: 'post_session',
            sessionId,
            page: '/session/end',
          }),
        });
        setFeedbackSent(true);
      } catch (error) {
        console.error('Feedback error:', error);
      }
    }
    // Navigate after a short delay
    setTimeout(() => router.push('/dashboard'), feedbackMessage.trim() ? 1500 : 0);
  };

  const handleSkipFeedback = () => {
    router.push('/dashboard');
  };

  const handleDiscard = () => {
    if (confirm('Discard this session without saving?')) {
      router.push('/dashboard');
    }
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getEncouragement = () => {
    if (elapsedMinutes >= 45) return "Deep work achieved. That's serious focus.";
    if (elapsedMinutes >= 25) return "Solid session. You showed up and did the work.";
    if (elapsedMinutes >= 15) return "Every minute counts. Progress is progress.";
    return "You started — that's the hardest part.";
  };

  // Post-session feedback prompt
  if (showFeedback) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_38%,_rgba(124,147,137,0.14)_0%,_transparent_62%)] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              {feedbackSent ? (
                <>
                  <h2 className="text-xl font-bold text-[#10221c] mb-2">Thanks!</h2>
                  <p className="text-[#7c9389]">Redirecting to dashboard...</p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-[#10221c]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-bold text-[#10221c] mb-2">Session saved!</h2>
                  <p className="text-[#7c9389] mb-6">Quick thought before you go?</p>

                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-[#7c9389]" />
                      <span className="text-sm font-medium text-[#48645b]">
                        How was this experience?
                      </span>
                    </div>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Anything you liked, didn't like, or wish was different..."
                      className="w-full h-20 px-4 py-3 text-sm bg-[#f4f7f2] border border-[#dfe4e0] rounded-xl text-[#10221c] placeholder-[#7c9389] focus:outline-none focus:ring-2 focus:ring-[#8aa89c]/25 focus:border-[#8aa89c] resize-none"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSkipFeedback}
                      className="flex-1 px-4 py-3 text-sm font-medium text-[#48645b] bg-[#eef1ed] rounded-xl hover:bg-[#e2e8e4] transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleFeedbackSubmit}
                      className="flex-[2] px-4 py-3 text-sm font-medium text-[#f0f0ec] bg-[#10221c] rounded-xl hover:bg-[#1a3229] transition-colors"
                    >
                      {feedbackMessage.trim() ? 'Send & Continue' : 'Continue'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_38%,_rgba(124,147,137,0.14)_0%,_transparent_62%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-[#eef1ed]">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#10221c]" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-[#10221c] mb-2">Session Complete!</h1>
            <p className="text-[#7c9389]">{getEncouragement()}</p>
            <div className="inline-flex items-center gap-2 mt-4">
              <Clock className="w-4 h-4 text-[#7c9389]" />
              <span className="text-sm font-medium text-[#48645b]">
                {formatDuration(elapsedMinutes)} of focus
              </span>
            </div>
          </div>

          {/* Task Summary */}
          <div className="px-8 py-4 bg-[#f4f7f2] border-b border-[#eef1ed]">
            <p className="text-sm text-[#7c9389] mb-1">You worked on</p>
            <p className="text-[#10221c] font-medium">{taskDescription}</p>
          </div>

          {/* Streak */}
          {!!currentStreak && currentStreak > 0 && (
            <div className="px-8 py-4 bg-[#eef1ed] border-b border-[#dfe4e0] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2f5648] to-[#10221c] flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#10221c]">{currentStreak + 1}-day streak!</p>
                <p className="text-sm text-[#48645b]">You're building momentum.</p>
              </div>
            </div>
          )}

          {/* Quick Rating */}
          <div className="p-8">
            <p className="text-sm font-medium text-[#48645b] mb-3">How was your focus?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData({ ...formData, focusQuality: num })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.focusQuality === num
                      ? 'bg-[#10221c] text-[#f0f0ec]'
                      : 'bg-[#eef1ed] text-[#7c9389] hover:bg-[#e2e8e4]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#7c9389] mt-2">
              <span>Distracted</span>
              <span>Deep focus</span>
            </div>
          </div>

          {/* Optional Details */}
          <div className="px-8 pb-4">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm text-[#7c9389] hover:text-[#48645b] transition-colors"
            >
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showDetails ? 'Hide details' : 'Add more details (optional)'}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#48645b] mb-2">
                    How many times did you get distracted?
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-[#f4f7f2] border border-[#dfe4e0] rounded-xl text-[#10221c] focus:outline-none focus:ring-2 focus:ring-[#8aa89c]/25 focus:border-[#8aa89c]"
                    value={formData.distractionCount}
                    onChange={(e) =>
                      setFormData({ ...formData, distractionCount: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                    max={99}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#48645b] mb-2">
                    What did you accomplish?
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-[#f4f7f2] border border-[#dfe4e0] rounded-xl text-[#10221c] placeholder-[#7c9389] focus:outline-none focus:ring-2 focus:ring-[#8aa89c]/25 focus:border-[#8aa89c] resize-none"
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
              className="flex-1 px-4 py-3 text-sm font-medium text-[#48645b] bg-[#eef1ed] rounded-xl hover:bg-[#e2e8e4] transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[#f0f0ec] bg-[#10221c] rounded-xl hover:bg-[#1a3229] transition-colors disabled:opacity-50"
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