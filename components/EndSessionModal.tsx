'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EndSessionModalProps {
  sessionId: string;
  taskDescription: string;
  elapsedMinutes: number;
}

export default function EndSessionModal({ 
  sessionId, 
  taskDescription,
  elapsedMinutes 
}: EndSessionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    focusQuality: 5,
    distractionCount: 0,
    outcome: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to save session. Please try again.');
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard this session?')) {
      router.push('/dashboard');
    }
  };


  const getGradientColor = (value: number) => {

    if (value <= 4) return '#F59E0B'; 
    if (value <= 7) return '#5DD9D8'; 
    return '#0D7377'; 
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <form 
        onSubmit={handleSubmit}
        className="card max-w-lg w-full mx-4 animate-slide-up"
      >
  
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <svg 
              className="w-6 h-6 text-teal-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
            <h2 className="text-2xl font-semibold">Session Complete</h2>
          </div>
          <p className="text-secondary text-sm">
            {elapsedMinutes} minutes focused on: {taskDescription}
          </p>
        </div>

    
        <div className="mb-6">
          <label className="label">
            How was your focus quality?
          </label>
          <div className="relative pt-6 pb-2">
 
            <input
              type="range"
              min="1"
              max="10"
              value={formData.focusQuality}
              onChange={(e) => setFormData({ ...formData, focusQuality: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #F59E0B 0%, #5DD9D8 50%, #0D7377 100%)`,
              }}
            />
            

            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2"
              style={{
                left: `${((formData.focusQuality - 1) / 9) * 100}%`,
              }}
            >
              <div 
                className="text-2xl font-semibold px-3 py-1 rounded-lg"
                style={{ 
                  color: getGradientColor(formData.focusQuality),
                }}
              >
                {formData.focusQuality}
              </div>
            </div>


            <div className="flex justify-between text-xs text-secondary mt-2">
              <span>1 (Distracted)</span>
              <span>10 (Perfect Focus)</span>
            </div>
          </div>
        </div>


        <div className="mb-6">
          <label htmlFor="distractions" className="label">
            How many times were you distracted?
          </label>
          <input
            id="distractions"
            type="number"
            className="input"
            value={formData.distractionCount}
            onChange={(e) => setFormData({ ...formData, distractionCount: parseInt(e.target.value) || 0 })}
            min={0}
            max={99}
          />
        </div>


        <div className="mb-8">
          <label htmlFor="outcome" className="label">
            What did you accomplish?
          </label>
          <textarea
            id="outcome"
            className="input resize-none"
            rows={3}
            placeholder="e.g., Finished design mockups, outlined blog post..."
            value={formData.outcome}
            onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
            maxLength={500}
          />
          {formData.outcome.length > 10 && (
            <p className="text-xs text-secondary text-right mt-1">
              {formData.outcome.length}/500
            </p>
          )}
        </div>


        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={loading}
            className="btn-ghost flex-1"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </form>
    </div>
  );
}