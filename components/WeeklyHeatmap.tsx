import type { HeatmapCell } from '@/types';

interface WeeklyHeatmapProps {
  data: HeatmapCell[];
}

export default function WeeklyHeatmap({ data }: WeeklyHeatmapProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeBlocks = ['9am', '12pm', '3pm', '6pm', '9pm'];


  const getCellColor = (avgFocus: number, sessionCount: number) => {
    if (sessionCount === 0) return '#F3F4F6'; 
    if (avgFocus >= 8) return '#0D7377'; 
    if (avgFocus >= 6) return '#5DD9D8'; 
    if (avgFocus >= 4) return '#CCF4F4'; 
    return '#F59E0B'; 
  };


  const getCellData = (day: string, time: string): HeatmapCell | undefined => {
    return data.find(cell => cell.day === day && cell.time_block === time);
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-6 text-secondary">Weekly Focus Patterns</h2>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
       
          <div className="flex gap-1">
        
            <div className="flex flex-col gap-1 pr-2">
              <div className="h-8" /> 
              {timeBlocks.map(time => (
                <div 
                  key={time} 
                  className="h-10 flex items-center justify-end text-xs text-secondary"
                >
                  {time}
                </div>
              ))}
            </div>

  
            {days.map(day => (
              <div key={day} className="flex flex-col gap-1">
          
                <div className="h-8 flex items-center justify-center text-xs font-medium text-secondary">
                  {day}
                </div>
                
         
                {timeBlocks.map(time => {
                  const cellData = getCellData(day, time);
                  const avgFocus = cellData?.avg_focus_quality || 0;
                  const sessionCount = cellData?.session_count || 0;
                  const color = getCellColor(avgFocus, sessionCount);

                  return (
                    <div
                      key={`${day}-${time}`}
                      className="w-10 h-10 rounded-md transition-all duration-200 hover:ring-2 hover:ring-teal-500 cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={
                        sessionCount > 0
                          ? `${day} ${time}: ${avgFocus.toFixed(1)}/10 focus (${sessionCount} session${sessionCount > 1 ? 's' : ''})`
                          : `${day} ${time}: No sessions`
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>

  
          <div className="flex items-center gap-4 mt-6 text-xs text-secondary">
            <span>Less focused</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F3F4F6' }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#CCF4F4' }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5DD9D8' }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0D7377' }} />
            </div>
            <span>More focused</span>
          </div>
        </div>
      </div>
    </div>
  );
}