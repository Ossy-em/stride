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
      color: '#65a30d', // lime-600
      bgColor: 'rgba(132, 204, 22, 0.1)',
      borderColor: '#84cc16',
    },
    { 
      value: 'neutral', 
      icon: Minus, 
      label: 'Neutral', 
      color: '#f59e0b', // amber-500
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#f59e0b',
    },
    { 
      value: 'distracted', 
      icon: ThumbsDown, 
      label: 'Distracted', 
      color: '#ef4444', // red-500
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: '#ef4444',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f2a1f]/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a3a2f] to-[#143527] mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Focus Check</h2>
            <p className="text-sm text-gray-500 mt-1">How's your focus right now?</p>
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
                    : 'border-gray-200 hover:border-gray-300 hover:scale-102'
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
                    backgroundColor: selectedResponse === value ? color : '#f3f4f6',
                  }}
                >
                  <Icon 
                    className="w-6 h-6 transition-colors"
                    style={{
                      color: selectedResponse === value ? 'white' : '#9ca3af'
                    }}
                  />
                </div>
                <span 
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: selectedResponse === value ? color : '#6b7280'
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
              className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all text-sm"
              placeholder="Quick note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
            />
            {note.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
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
            className="flex-1 px-5 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Dismiss
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedResponse || submitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-[#1a3a2f] bg-lime-400 rounded-full hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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