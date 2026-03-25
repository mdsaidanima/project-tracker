import React, { useMemo } from 'react';
import { useStore } from '../store/store';
import { filterTasks } from '../utils/filter-tasks';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday, differenceInDays } from 'date-fns';

export const TimelineView: React.FC = () => {
  const storeTasks = useStore(state => state.tasks);
  const filters = useStore(state => state.filters);
  const tasks = useMemo(() => filterTasks(storeTasks, filters), [storeTasks, filters]);
  
  // Current month intervals
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const DAY_WIDTH = 40; // pixels per day
  
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-red-500 text-white border-red-400';
      case 'High': return 'bg-orange-500 text-white border-orange-400';
      case 'Medium': return 'bg-amber-500 text-slate-900 border-amber-400';
      case 'Low': return 'bg-emerald-500 text-slate-900 border-emerald-400';
      default: return 'bg-slate-500 text-white border-slate-400';
    }
  };

  const getTaskStyle = (startDateStr: string | null, dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const startDate = startDateStr ? new Date(startDateStr) : dueDate;

    // Start offset from beginning of month
    let startOffsetDiff = differenceInDays(startDate, monthStart);
    let duration = differenceInDays(dueDate, startDate) + 1; // inclusive

    // Clip to month bounds visually
    if (startOffsetDiff < 0) {
      duration += startOffsetDiff; // reduce duration 
      startOffsetDiff = 0;
    }
    
    const maxDuration = differenceInDays(monthEnd, monthStart) + 1 - startOffsetDiff;
    if (duration > maxDuration) {
      duration = maxDuration;
    }

    // If perfectly out of bounds
    if (startOffsetDiff >= daysInMonth.length || duration <= 0) {
      return { display: 'none' };
    }

    return {
      left: `${startOffsetDiff * DAY_WIDTH}px`,
      width: `${Math.max(duration * DAY_WIDTH - 4, DAY_WIDTH - 4)}px`, // -4 for gaps
    };
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden relative">
      <div className="flex-1 overflow-auto p-6">
        <div className="relative min-w-max">
          
          {/* Header row with dates */}
          <div className="flex border-b border-slate-700 pb-2 mb-4 sticky top-0 bg-slate-900/90 z-20 backdrop-blur">
            {daysInMonth.map((day, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center flex-shrink-0"
                style={{ width: DAY_WIDTH }}
              >
                <span className={`text-xs ${isToday(day) ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                  {format(day, 'E')}
                </span>
                <span className={`text-sm ${isToday(day) ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Grid Background */}
          <div className="absolute top-[52px] bottom-0 left-0 right-0 flex pointer-events-none z-0">
            {daysInMonth.map((day, idx) => (
              <div 
                key={idx} 
                className={`border-r border-slate-800/50 flex-shrink-0 relative ${isToday(day) ? 'bg-indigo-500/5' : ''}`}
                style={{ width: DAY_WIDTH }}
              >
                {/* Today Marker */}
                {isToday(day) && (
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-indigo-500 z-0 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>

          {/* Tasks Container */}
          <div className="flex flex-col gap-2 relative z-10 py-2">
            {tasks.map(task => {
              const style = getTaskStyle(task.startDate, task.dueDate);
              if (style.display === 'none') return null;

              return (
                <div key={task.id} className="h-8 relative" style={{ width: daysInMonth.length * DAY_WIDTH }}>
                  <div 
                    className={`absolute top-0 bottom-0 rounded-md border text-xs px-2 truncate flex items-center shadow-sm cursor-pointer hover:brightness-110 transition ${getPriorityColor(task.priority)}`}
                    style={{ ...style }}
                    title={`${task.title} (${task.startDate || task.dueDate} - ${task.dueDate})`}
                  >
                    {task.title}
                  </div>
                </div>
              );
            })}
            
            {tasks.length === 0 && (
              <div className="text-slate-400 text-center py-10 w-full" style={{ width: daysInMonth.length * DAY_WIDTH }}>
                No tasks to display in this timeframe.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
