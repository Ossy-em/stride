import { Sparkles, Target, Lightbulb, TrendingUp } from 'lucide-react';

interface AIInsightsProps {
  insights: string[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
  const insightIcons = [Target, Lightbulb, TrendingUp];

  return (
    <div className="card relative overflow-hidden">
    
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-900/10 pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-amber" />
          <h2 className="text-lg font-semibold">AI Insights</h2>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-secondary text-sm">
              Complete a few more sessions to unlock personalized insights.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = insightIcons[index % insightIcons.length];
              
              return (
                <div 
                  key={index}
                  className="flex gap-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800 transition-all group"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 flex-1">
                    {insight}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}