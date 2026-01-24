
import ABTestDashboard from '@/components/ABTestDashboard';
import Link from 'next/link';
import { BarChart, Activity, Target } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stride Demo Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                A/B Testing & Evaluation Metrics for Judges
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">About This Demo</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Stride uses <strong>AI-powered A/B testing</strong> to optimize focus interventions. 
            We test 3 message variants (Direct, Question, Challenge) across 3 timing offsets 
            (2, 5, 8 minutes before predicted focus drop) to find the most effective combination 
            for each user.
          </p>
          <p className="text-gray-700 leading-relaxed">
            All AI interactions are logged to <strong>Opik</strong> for observability and evaluation, 
            including prompt performance, latency tracking, and effectiveness metrics.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">A/B Testing</h3>
            <p className="text-gray-600 text-sm">
              9 variant combinations tested per user to find optimal intervention strategy
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Real-time Evaluation</h3>
            <p className="text-gray-600 text-sm">
              Opik SDK tracks every AI call with prompt, response, latency, and tokens
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Data-Driven</h3>
            <p className="text-gray-600 text-sm">
              User-specific optimization based on historical effectiveness rates
            </p>
          </div>
        </div>

        {/* A/B Test Dashboard */}
        <ABTestDashboard />

        {/* Opik Integration Info */}
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Opik Integration</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="text-teal-600 font-bold mr-3">✓</span>
              <span>Every AI call logged with full context (prompts, responses, latency, tokens)</span>
            </div>
            <div className="flex items-start">
              <span className="text-teal-600 font-bold mr-3">✓</span>
              <span>Pattern confidence scores evaluated using LLM-as-judge</span>
            </div>
            <div className="flex items-start">
              <span className="text-teal-600 font-bold mr-3">✓</span>
              <span>Intervention effectiveness tracked and analyzed per variant</span>
            </div>
            <div className="flex items-start">
              <span className="text-teal-600 font-bold mr-3">✓</span>
              <span>A/B test metadata attached to every trace for deep analysis</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-teal-200">
            <Link
              href="/api/opik/traces"
              className="inline-flex items-center px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View Raw Opik Traces →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}