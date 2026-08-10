'use client';

import { useState } from 'react';
import { ThumbsUp, Minus, ThumbsDown, X, Send } from 'lucide-react';
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
    bgColor: string;
    borderColor: string;
  }[] = [
    { 
      value: 'focused', 
      icon: ThumbsUp, 
      label: 'Focused', 
      color: '#10221c',
      bgColor: 'rgba(16,34,28,0.06)',
      borderColor: '#8aa89c',
    },
    { 
      value: 'neutral', 
      icon: Minus, 
      label: 'Neutral', 
      color: '#7c9389',
      bgColor: 'rgba(124,147,137,0.10)',
      borderColor: '#7c9389',
    },
    { 
      value: 'distracted', 
      icon: ThumbsDown, 
      label: 'Distracted', 
      color: '#b4c5bd', // red-500
      bgColor: 'rgba(180,197,189,0.15)',
      borderColor: '#b4c5bd',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#10221c]/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#7c9389] hover:text-[#48645b] hover:bg-[#eef1ed] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2f5648] to-[#10221c] mb-4">
              
            </div>
            <h2 className="text-xl font-bold text-[#10221c]">Quick Focus Check</h2>
            <p className="text-sm text-[#7c9389] mt-1">How's your focus right now?</p>
          </div>
        </div>

        {/* Response Buttons */}
        <div className="px-6 pb-4">
          <div className="flex justify-center gap-3">
            {responses.map(({ value, icon: Icon, label, color, bgColor, borderColor }) => (
              <button
                key={value}
                onClick={() => setSelectedResponse(value)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-2xl flex-1
                  transition-all duration-200 border-2
                  ${selectedResponse === value 
                    ? 'scale-105 shadow-lg' 
                    : 'border-[#dfe4e0] hover:border-[#cbd8d1] hover:scale-102'
                  }
                `}
                style={{
                  borderColor: selectedResponse === value ? borderColor : undefined,
                  backgroundColor: selectedResponse === value ? bgColor : undefined,
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: selectedResponse === value ? color : '#eef1ed',
                  }}
                >
                  <Icon 
                    className="w-6 h-6 transition-colors"
                    style={{
                      color: selectedResponse === value ? 'white' : '#7c9389'
                    }}
                  />
                </div>
                <span 
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: selectedResponse === value ? color : '#7c9389'
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Note */}
        <div className="px-6 pb-4">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 pr-10 bg-[#f4f7f2] border border-[#dfe4e0] rounded-xl text-[#10221c] placeholder-[#7c9389] focus:outline-none focus:ring-2 focus:ring-[#8aa89c]/25 focus:border-[#8aa89c] transition-all text-sm"
              placeholder="Quick note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
            />
            {note.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7c9389]">
                {note.length}/100
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-5 py-3 text-sm font-medium text-[#48645b] bg-[#eef1ed] rounded-full hover:bg-[#e2e8e4] transition-colors disabled:opacity-50"
          >
            Dismiss
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedResponse || submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#f0f0ec] bg-[#10221c] rounded-full hover:bg-[#1a3229] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Continue</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}