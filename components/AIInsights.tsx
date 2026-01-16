interface AIInsightsProps {
  insights: string[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
  const insightIcons = ['🎯', '💡', '📊'];

  return (
    <div className="card" style={{ 
      background: 'linear-gradient(to bottom right, #FFFFFF, #F0F9F9)' 
    }}>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">✨</span>
        <h2 className="text-lg font-semibold">Insights</h2>
      </div>

      {insights.length === 0 ? (
        <p className="text-secondary text-sm">
          Complete a few more sessions to unlock personalized insights.
        </p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="flex gap-3 p-3 rounded-lg bg-white/60 dark:bg-card-dark/60"
            >
              <span className="text-lg flex-shrink-0">
                {insightIcons[index % insightIcons.length]}
              </span>
              <p className="text-sm leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}