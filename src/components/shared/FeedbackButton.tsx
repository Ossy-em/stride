'use client';

import { useState } from 'react';
import { MessageSquarePlus, X, Send, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'issue' | 'idea' | 'general'>('general');
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
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#10221c] text-white rounded-full shadow-lg hover:bg-[#1a3229] transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-[#e6ebe8] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#10221c]">
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
          <p className="text-sm font-medium text-[#10221c]">Thanks for the feedback!</p>
          <p className="text-xs text-[#7c9389] mt-1">This helps make Stride better.</p>
        </div>
      ) : (
        <div className="p-4">
          {/* Type selector */}
          <div className="flex gap-2 mb-3">
            {[
              { value: 'issue' as const, label: ' Issue' },
              { value: 'idea' as const, label: ' Idea' },
              { value: 'general' as const, label: ' General' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setType(option.value)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  type === option.value
                    ? 'bg-[#10221c] text-[#f0f0ec]'
                    : 'bg-[#f4f7f2] text-[#48645b] hover:bg-[#eef1ed]'
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
              type === 'issue'
                ? "What happened? What did you expect?"
                : type === 'idea'
                ? "What would make Stride better?"
                : "What's on your mind?"
            }
            className="w-full h-24 px-3 py-2 text-sm bg-[#f4f7f2] border border-[#dfe4e0] rounded-xl text-[#10221c] placeholder-[#7c9389] focus:outline-none focus:ring-2 focus:ring-[#8aa89c]/20 focus:border-[#8aa89c] resize-none"
            autoFocus
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || sending}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[#f0f0ec] bg-[#10221c] rounded-xl hover:bg-[#1a3229] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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