'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Trash2, Save, Sparkles } from 'lucide-react';

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

  // Updated gradient colors to match landing page palette
  const getGradientColor = (value: number) => {
    if (value <= 4) return '#f59e0b'; // amber-500 (warning/low)
    if (value <= 7) return '#84cc16'; // lime-500 (good)
    return '#65a30d'; // lime-600 (excellent)
  };

  const getFocusLabel = (value: number) => {
    if (value <= 3) return 'Struggling';
    if (value <= 5) return 'Moderate';
    if (value <= 7) return 'Good';
    if (value <= 9) return 'Excellent';
    return 'Perfect';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0f2a1f]/80 backdrop-blur-sm"
        onClick={handleDiscard}
      />
      
      {/* Modal */}
      <form 
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-[#0f2a1f] via-[#143527] to-[#1a4a35] px-6 py-8 relative overflow-hidden">
          {/* Subtle radial overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(132,204,22,0.15)_0%,_transparent_60%)]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#1a3a2f]" />
              </div>
              <h2 className="text-2xl font-bold text-white">Session Complete</h2>
            </div>
            <p className="text-white/60 text-sm">
              <span className="text-lime-400 font-medium">{elapsedMinutes} minutes</span> focused on: {taskDescription}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          
          {/* Focus Quality Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How was your focus quality?
            </label>
            
            {/* Current value display - fixed position above slider */}
            <div className="flex items-center justify-center gap-2 mb-4 py-2">
              <span 
                className="text-3xl font-bold tabular-nums"
                style={{ color: getGradientColor(formData.focusQuality) }}
              >
                {formData.focusQuality}
              </span>
              <span 
                className="text-sm font-medium px-2 py-0.5 rounded-full"
                style={{ 
                  color: getGradientColor(formData.focusQuality),
                  backgroundColor: `${getGradientColor(formData.focusQuality)}15`,
                }}
              >
                {getFocusLabel(formData.focusQuality)}
              </span>
            </div>

            {/* Custom Range Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.focusQuality}
                onChange={(e) => setFormData({ ...formData, focusQuality: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #84cc16 50%, #65a30d 100%)`,
                }}
              />
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-gray-400 mt-3">
              <span>1 (Distracted)</span>
              <span>10 (Deep Focus)</span>
            </div>
          </div>

          {/* Distraction Count */}
          <div>
            <label htmlFor="distractions" className="block text-sm font-medium text-gray-700 mb-2">
              How many times were you distracted?
            </label>
            <input
              id="distractions"
              type="number"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all"
              value={formData.distractionCount}
              onChange={(e) => setFormData({ ...formData, distractionCount: parseInt(e.target.value) || 0 })}
              min={0}
              max={99}
            />
          </div>

          {/* Outcome Textarea */}
          <div>
            <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-2">
              What did you accomplish?
            </label>
            <div className="relative">
              <textarea
                id="outcome"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all resize-none"
                rows={3}
                placeholder="e.g., Finished design mockups, outlined blog post..."
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                maxLength={500}
              />
              {formData.outcome.length > 0 && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-lime-500" />
                  <span className="text-xs text-gray-400">
                    {formData.outcome.length}/500
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {/* Action Buttons - stack on very small screens */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={loading}
            className="sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            <span>Discard</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 flex-shrink-0" />
                <span>Save</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Custom slider thumb styles */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #1a3a2f;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: transform 0.15s ease;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #1a3a2f;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}