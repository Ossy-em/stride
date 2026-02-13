'use client';

import { useState } from 'react';
import { MessageSquarePlus, X, Send, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'bug' | 'idea' | 'general'>('general');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const pathname = usePathname();

  // Don't show on auth pages or during active sessions
  if (pathname?.includes('/auth') || pathname?.includes('/session/active')) {
    return null;
  }

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          type,
          page: pathname,
        }),
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => {
          setIsOpen(false);
          setSent(false);
          setMessage('');
          setType('general');
        }, 2000);
      }
    } catch (error) {
      console.error('Feedback submit error:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#1a3a2f] text-white rounded-full shadow-lg hover:bg-[#0f2a1f] transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f2a1f]">
        <span className="text-sm font-medium text-white">Send Feedback</span>
        <button
          onClick={() => {
            setIsOpen(false);
            setSent(false);
          }}
          className="text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {sent ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-lime-100 flex items-center justify-center">
            <span className="text-xl">🙏</span>
          </div>
          <p className="text-sm font-medium text-gray-900">Thanks for the feedback!</p>
          <p className="text-xs text-gray-500 mt-1">This helps make Stride better.</p>
        </div>
      ) : (
        <div className="p-4">
          {/* Type selector */}
          <div className="flex gap-2 mb-3">
            {[
              { value: 'bug' as const, label: '🐛 Bug' },
              { value: 'idea' as const, label: '💡 Idea' },
              { value: 'general' as const, label: '💬 General' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setType(option.value)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  type === option.value
                    ? 'bg-lime-100 text-lime-800 border border-lime-300'
                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              type === 'bug'
                ? "What happened? What did you expect?"
                : type === 'idea'
                ? "What would make Stride better?"
                : "What's on your mind?"
            }
            className="w-full h-24 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 resize-none"
            autoFocus
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || sending}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#0f2a1f] bg-lime-400 rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Send
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}