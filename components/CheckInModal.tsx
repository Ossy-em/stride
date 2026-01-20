'use client';

import { useState } from 'react';
import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react';
import type { CheckInResponse } from '@/types';

interface CheckInModalProps {
  sessionId: string;
  onClose: () => void;
}

export default function CheckInModal({ sessionId, onClose }: CheckInModalProps) {
  const [selectedResponse, setSelectedResponse] = useState<CheckInResponse | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedResponse) return;
    
    setSubmitting(true);

    try {
      const response = await fetch('/api/sessions/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          response: selectedResponse,
          note: note.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to save check-in');

      setTimeout(onClose, 300);
    } catch (error) {
      console.error('Error saving check-in:', error);
      alert('Failed to save check-in');
      setSubmitting(false);
    }
  };

  const responses: { 
    value: CheckInResponse; 
    icon: typeof ThumbsUp; 
    label: string;
    color: string;
  }[] = [
    { value: 'focused', icon: ThumbsUp, label: 'Focused', color: 'teal' },
    { value: 'neutral', icon: Minus, label: 'Neutral', color: 'amber' },
    { value: 'distracted', icon: ThumbsDown, label: 'Distracted', color: 'coral' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="card max-w-md w-full mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-6">Quick Focus Check</h2>

        {/* Icon Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          {responses.map(({ value, icon: Icon, label, color }) => (
            <button
              key={value}
              onClick={() => setSelectedResponse(value)}
              className={`
                flex flex-col items-center gap-2 p-5 rounded-2xl
                transition-all duration-200 border-2
                ${selectedResponse === value 
                  ? `bg-${color}/5 border-${color} scale-105 shadow-lg` 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:scale-105'
                }
              `}
              style={{
                borderColor: selectedResponse === value 
                  ? color === 'teal' ? '#14B8A6' : color === 'amber' ? '#FBBF24' : '#F87171'
                  : undefined,
                backgroundColor: selectedResponse === value 
                  ? color === 'teal' ? 'rgba(20, 184, 166, 0.05)' : color === 'amber' ? 'rgba(251, 191, 36, 0.05)' : 'rgba(248, 113, 113, 0.05)'
                  : undefined,
              }}
              title={label}
            >
              <Icon 
                className="w-7 h-7"
                style={{
                  color: selectedResponse === value 
                    ? color === 'teal' ? '#14B8A6' : color === 'amber' ? '#FBBF24' : '#F87171'
                    : '#9CA3AF'
                }}
              />
              <span className="text-xs font-medium text-secondary">{label}</span>
            </button>
          ))}
        </div>

        {/* Optional Note */}
        <input
          type="text"
          className="input mb-6"
          placeholder="Quick note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={100}
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-ghost flex-1"
            disabled={submitting}
          >
            Dismiss
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedResponse || submitting}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}