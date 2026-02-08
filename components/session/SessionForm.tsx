'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock, Zap, Code, PenTool, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type TaskType = 'coding' | 'writing' | 'reading';

export default function SessionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    taskDescription: '',
    taskType: 'coding' as TaskType,
    plannedDuration: 25,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to start session');
      const { sessionId } = await response.json();
      router.push(`/session/active?id=${sessionId}`);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Please try again.');
      setLoading(false);
    }
  };

  const taskTypes = [
    { value: 'coding', label: 'Development', icon: Code },
    { value: 'writing', label: 'Writing', icon: PenTool },
    { value: 'reading', label: 'Learning', icon: BookOpen },
  ];

  const durationPresets = [15, 25, 45, 60];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#1a3a2f]" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-gray-900">Stride</span>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Start Focus Session</h1>
          <p className="text-gray-500">What do you want to accomplish?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Description */}
          <div>
            <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
              What will you work on?
            </label>
            <input
              id="task"
              type="text"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:border-lime-500 transition-all"
              placeholder="e.g., Debug API bug, Write blog post outline..."
              value={formData.taskDescription}
              onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
              required
              maxLength={200}
              autoFocus
            />
          </div>

          {/* Task Type - Visual Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Task Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {taskTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, taskType: value as TaskType })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    formData.taskType === value
                      ? 'border-lime-500 bg-lime-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.taskType === value
                        ? 'bg-lime-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      formData.taskType === value ? 'text-lime-700' : 'text-gray-600'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration - Preset Buttons + Custom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Focus Duration
              </div>
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {durationPresets.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setFormData({ ...formData, plannedDuration: mins })}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.plannedDuration === mins
                      ? 'bg-[#1a3a2f] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {mins} min
                </button>
              ))}
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                <input
                  type="number"
                  className="w-12 bg-transparent text-center text-sm font-medium text-gray-700 focus:outline-none"
                  value={formData.plannedDuration}
                  onChange={(e) =>
                    setFormData({ ...formData, plannedDuration: parseInt(e.target.value) || 25 })
                  }
                  min={5}
                  max={120}
                />
                <span className="text-sm text-gray-400">min</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Tip: Start with 25 minutes. You can always extend.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.taskDescription.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-lime-400 text-[#1a3a2f] font-semibold rounded-xl hover:bg-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-[#1a3a2f] border-t-transparent rounded-full animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Begin Focus Session</span>
              </>
            )}
          </button>
        </form>

        {/* Quick tip */}
        <div className="mt-8 p-4 bg-white border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">💡 Quick tip:</span> Be specific about your
            task. "Write intro paragraph for blog post" works better than "Work on blog."
          </p>
        </div>
      </main>
    </div>
  );
}