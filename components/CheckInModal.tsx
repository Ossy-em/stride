'use client';

import { useState } from 'react';
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

  const responses: { value: CheckInResponse; emoji: string; label: string }[] = [
    { value: 'focused', emoji: '👍', label: 'Focused' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'distracted', emoji: '👎', label: 'Distracted' },
  ];

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="card max-w-md w-full mx-4 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-6">Quick Check</h2>

    
        <div className="flex justify-center gap-4 mb-6">
          {responses.map(({ value, emoji, label }) => (
          <button
  key={value}
  onClick={() => setSelectedResponse(value)}
  className={`
    flex flex-col items-center gap-2 p-4 rounded-lg
    transition-all duration-200 border-2
    ${selectedResponse === value 
      ? 'bg-teal-50 dark:bg-teal-700 border-teal-500 scale-105' 
      : 'border-transparent hover:scale-105'
    }
  `}
  style={{
    filter: selectedResponse === value ? 'none' : 'grayscale(80%)',
  }}
  onMouseEnter={(e) => {
    if (selectedResponse !== value) {
      e.currentTarget.style.filter = 'grayscale(0%)';
    }
  }}
  onMouseLeave={(e) => {
    if (selectedResponse !== value) {
      e.currentTarget.style.filter = 'grayscale(80%)';
    }
  }}
  title={label}
>
  <span className="text-5xl">{emoji}</span>
  <span className="text-xs text-secondary">{label}</span>
</button>
          ))}
        </div>

   
        <input
          type="text"
          className="input mb-6"
          placeholder="Quick note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={100}
        />

 
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
            {submitting ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}