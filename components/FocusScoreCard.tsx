import { Flame } from 'lucide-react';
interface FocusScoreCardProps {
  todayScore: number; 
  weeklyTrend: number; 
}

export default function FocusScoreCard({ todayScore, weeklyTrend }: FocusScoreCardProps) {

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (todayScore / 100) * circumference;


  const getScoreColor = (score: number) => {
    if (score >= 80) return '#0D7377'; 
    if (score >= 60) return '#5DD9D8'; 
    if (score >= 40) return '#F59E0B'; 
    return '#EF8275'; 
  };

  const trendPositive = weeklyTrend >= 0;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-6 text-secondary">Today's Focus</h2>
      
      <div className="flex items-center justify-between">
 
        <div className="relative">
          <svg width="140" height="140" className="transform -rotate-90">
  
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
              className="dark:stroke-gray-700"
            />

            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke={getScoreColor(todayScore)}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="score-display">{todayScore}</span>
            <span className="text-sm text-secondary">/100</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-4">
       
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              trendPositive 
                ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' 
                : 'bg-coral/10 text-coral'
            }`}>
              <svg 
                className="w-4 h-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                style={{ transform: trendPositive ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {Math.abs(weeklyTrend)}% from last week
            </div>
          </div>

       
          <p className="text-sm text-secondary max-w-xs">
            {todayScore >= 80 && "Exceptional focus today! Keep it up."}
            {todayScore >= 60 && todayScore < 80 && "Solid focus. You're in the zone."}
            {todayScore >= 40 && todayScore < 60 && "Decent session. Room to improve."}
            {todayScore < 40 && "Tough day? Tomorrow is a fresh start."}
          </p>
        </div>
      </div>
       {/* Stats */}
        <div className="flex flex-col gap-4">
          {/* Weekly Trend */}
          <div className="flex items-center gap-2">
            {/* ... existing trend code ... */}
          </div>

          {/* NEW: Streak Counter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber/10 to-amber/5 rounded-xl border border-amber/20">
            <Flame className="w-5 h-5 text-amber" />
            <div>
              <div className="text-lg font-bold text-amber">5 Days</div>
              <div className="text-xs text-secondary">Current Streak</div>
            </div>
          </div>

          {/* Quick Insight */}
          <p className="text-sm text-secondary max-w-xs">
            {/* ... existing insight code ... */}
          </p>
        </div>
    </div>
  );
}