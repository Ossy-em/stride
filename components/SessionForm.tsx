'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TaskType } from '@/types';

export default function SessionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    taskDescription: '',
    taskType: 'coding' as TaskType,
    plannedDuration: 45,
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="card max-w-md w-full">
      <h1 className="text-2xl font-semibold mb-6">
  Start Focus Session
</h1>

      
        <div className="mb-6">
          <label htmlFor="task" className="label">
            What will you work on?
          </label>
          <input
            id="task"
            type="text"
            className="input"
            placeholder="e.g., Debug API bug, Write blog post outline..."
            value={formData.taskDescription}
            onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
            required
            maxLength={200}
            autoFocus
          />
        </div>

    
        <div className="mb-6">
          <label htmlFor="taskType" className="label">
            Task Type
          </label>
          <select
            id="taskType"
            className="input cursor-pointer"
            value={formData.taskType}
            onChange={(e) => setFormData({ ...formData, taskType: e.target.value as TaskType })}
          >
            <option value="coding">Coding</option>
            <option value="writing">Writing</option>
            <option value="reading">Reading</option>
          </select>
        </div>

   
        <div className="mb-8">
          <label htmlFor="duration" className="label">
            Focus Duration
          </label>
          <div className="flex items-center gap-3">
            <span className="text-text-secondary">Focus for</span>
            <input
              id="duration"
              type="number"
              className="input w-20 text-center"
              value={formData.plannedDuration}
              onChange={(e) => setFormData({ ...formData, plannedDuration: parseInt(e.target.value) })}
              min={5}
              max={120}
              required
            />
            <span className="text-text-secondary">minutes</span>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Recommended: 25-50 minutes
          </p>
        </div>


        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Preparing...' : 'Begin Focus Session'}
        </button>
      </form>
    </div>
  );
}