'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import type { HeatmapCell } from '@/types';

interface WeeklyHeatmapProps {
  data: HeatmapCell[];
}

type ViewMode = 'week' | 'month' | 'year';

export default function WeeklyHeatmap({ data }: WeeklyHeatmapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#1a3a2f]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Focus Patterns</h2>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full">
          {(['week', 'month', 'year'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${viewMode === mode
                  ? 'bg-white text-[#1a3a2f] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Render based on view mode */}
      {viewMode === 'week' && <WeekView data={data} />}
      {viewMode === 'month' && <MonthView />}
      {viewMode === 'year' && <YearView />}
    </div>
  );
}

// Week View (Original Heatmap)
function WeekView({ data }: { data: HeatmapCell[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeBlocks = ['9am', '12pm', '3pm', '6pm', '9pm'];

  // Updated colors to match landing page palette
  const getCellColor = (avgFocus: number, sessionCount: number) => {
    if (sessionCount === 0) return '#F3F4F6'; // gray-100
    if (avgFocus >= 8) return '#65a30d'; // lime-600
    if (avgFocus >= 6) return '#84cc16'; // lime-500
    if (avgFocus >= 4) return '#bef264'; // lime-300
    return '#fbbf24'; // amber-400
  };

  const getCellData = (day: string, time: string): HeatmapCell | undefined => {
    return data.find(cell => cell.day === day && cell.time_block === time);
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1">
          {/* Time labels */}
          <div className="flex flex-col gap-1 pr-3">
            <div className="h-10" />
            {timeBlocks.map(time => (
              <div 
                key={time} 
                className="h-12 flex items-center justify-end text-xs text-gray-500 font-medium"
              >
                {time}
              </div>
            ))}
          </div>

          {/* Heatmap cells */}
          {days.map(day => (
            <div key={day} className="flex flex-col gap-1">
              {/* Day label */}
              <div className="h-10 flex items-center justify-center text-xs font-semibold text-gray-500">
                {day}
              </div>
              
              {/* Time block cells */}
              {timeBlocks.map(time => {
                const cellData = getCellData(day, time);
                const avgFocus = cellData?.avg_focus_quality || 0;
                const sessionCount = cellData?.session_count || 0;
                const color = getCellColor(avgFocus, sessionCount);

                return (
                  <div
                    key={`${day}-${time}`}
                    className="w-12 h-12 rounded-xl transition-all duration-200 hover:ring-2 hover:ring-lime-500 hover:scale-105 cursor-pointer relative group"
                    style={{ backgroundColor: color }}
                    title={
                      sessionCount > 0
                        ? `${day} ${time}: ${avgFocus.toFixed(1)}/10 focus (${sessionCount} session${sessionCount > 1 ? 's' : ''})`
                        : `${day} ${time}: No sessions`
                    }
                  >
                    {/* Tooltip on hover */}
                    {sessionCount > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a3a2f] text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{avgFocus.toFixed(1)}/10 Focus</div>
                        <div className="text-white/60">{sessionCount} session{sessionCount > 1 ? 's' : ''}</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a3a2f]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-8 text-xs text-gray-500">
          <span className="font-medium">Less focused</span>
          <div className="flex gap-1.5">
            <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: '#F3F4F6' }} title="No sessions" />
            <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: '#bef264' }} title="4-6 focus" />
            <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: '#84cc16' }} title="6-8 focus" />
            <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: '#65a30d' }} title="8+ focus" />
          </div>
          <span className="font-medium">More focused</span>
        </div>
      </div>
    </div>
  );
}

// Month View (4-week calendar)
function MonthView() {
  const weeks = 4;
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // TODO: DUMMY DATA - Replace with API fetch
  const generateMockMonthData = () => {
    const data = [];
    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        data.push({
          week,
          day,
          avgFocus: Math.random() * 10,
          sessionCount: Math.floor(Math.random() * 4),
        });
      }
    }
    return data;
  };

  const monthData = generateMockMonthData();

  const getCellColor = (avgFocus: number, sessionCount: number) => {
    if (sessionCount === 0) return '#F3F4F6';
    if (avgFocus >= 8) return '#65a30d';
    if (avgFocus >= 6) return '#84cc16';
    if (avgFocus >= 4) return '#bef264';
    return '#fbbf24';
  };

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-lime-600" />
        <h3 className="font-semibold text-lg text-gray-900">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {daysOfWeek.map((day, i) => (
            <div key={i} className="text-center text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const cellData = monthData.find(d => d.week === weekIndex && d.day === dayIndex);
              const color = getCellColor(cellData?.avgFocus || 0, cellData?.sessionCount || 0);
              
              return (
                <div
                  key={dayIndex}
                  className="aspect-square rounded-xl transition-all duration-200 hover:ring-2 hover:ring-lime-500 hover:scale-105 cursor-pointer relative group"
                  style={{ backgroundColor: color }}
                >
                  {/* Day number */}
                  <div className="absolute top-1 left-1.5 text-xs font-medium text-gray-700">
                    {weekIndex * 7 + dayIndex + 1}
                  </div>
                  
                  {/* Tooltip */}
                  {cellData && cellData.sessionCount > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a3a2f] text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{cellData.avgFocus.toFixed(1)}/10 Focus</div>
                      <div className="text-white/60">{cellData.sessionCount} sessions</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a3a2f]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Stats summary - TODO: DUMMY DATA */}
      <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#1a3a2f]">24</div>
          <div className="text-xs text-gray-500 mt-1">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-lime-600">7.8</div>
          <div className="text-xs text-gray-500 mt-1">Avg Focus</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#1a3a2f]">18h</div>
          <div className="text-xs text-gray-500 mt-1">Total Time</div>
        </div>
      </div>
    </div>
  );
}

// Year View (12-month overview)
function YearView() {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // TODO: DUMMY DATA - Replace with API fetch
  const generateYearData = () => {
    return months.map((month) => ({
      month,
      avgFocus: 5 + Math.random() * 4,
      sessionCount: Math.floor(10 + Math.random() * 30),
      totalHours: Math.floor(15 + Math.random() * 35),
    }));
  };

  const yearData = generateYearData();

  const getBarHeight = (avgFocus: number) => {
    return `${(avgFocus / 10) * 100}%`;
  };

  const getBarColor = (avgFocus: number) => {
    if (avgFocus >= 8) return 'bg-lime-600';
    if (avgFocus >= 6) return 'bg-lime-500';
    if (avgFocus >= 4) return 'bg-amber-400';
    return 'bg-red-400';
  };

  return (
    <div>
      {/* Year header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-lime-600" />
          <h3 className="font-semibold text-lg text-gray-900">
            {new Date().getFullYear()} Overview
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          Avg: <span className="font-semibold text-lime-600">7.2/10</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2 h-48 mb-6">
        {yearData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
            {/* Bar */}
            <div className="w-full relative flex items-end" style={{ height: '100%' }}>
              <div 
                className={`w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${getBarColor(data.avgFocus)}`}
                style={{ height: getBarHeight(data.avgFocus) }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a3a2f] text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <div className="font-semibold">{data.month} {new Date().getFullYear()}</div>
                  <div className="text-white/60 mt-1">Focus: {data.avgFocus.toFixed(1)}/10</div>
                  <div className="text-white/60">{data.sessionCount} sessions</div>
                  <div className="text-white/60">{data.totalHours}h total</div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a3a2f]" />
                </div>
              </div>
            </div>
            
            {/* Month label */}
            <div className="text-xs font-medium text-gray-500">
              {data.month}
            </div>
          </div>
        ))}
      </div>

      {/* Year stats - TODO: DUMMY DATA */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#1a3a2f]">287</div>
          <div className="text-xs text-gray-500 mt-1">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-lime-600">7.2</div>
          <div className="text-xs text-gray-500 mt-1">Yearly Avg</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#1a3a2f]">215h</div>
          <div className="text-xs text-gray-500 mt-1">Total Time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-500">🔥 12</div>
          <div className="text-xs text-gray-500 mt-1">Best Streak</div>
        </div>
      </div>
    </div>
  );
}