import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { filterTasks } from '../utils/filter-tasks';
import { Task, Status, Priority } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const ROW_HEIGHT = 64; 
const BUFFER_ROWS = 5;

type SortKey = 'title' | 'priority' | 'dueDate';
type SortDirection = 'asc' | 'desc';

export const ListView: React.FC = () => {
  const storeTasks = useStore(state => state.tasks);
  const filters = useStore(state => state.filters);
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  const updateTask = useStore(state => state.updateTask);
  
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const filteredTasks = useMemo(() => filterTasks(storeTasks, filters), [storeTasks, filters]);
  
  // Custom sorting
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;
      
      if (sortKey === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortKey === 'priority') {
        const pOrder: Record<Priority, number> = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        comparison = pOrder[a.priority] - pOrder[b.priority];
      } else if (sortKey === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
      }
      
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [filteredTasks, sortKey, sortDir]);

  // Virtual Scrolling State
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    
    // Initial size
    updateSize();
    
    // Resize observer
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
  const endIndex = Math.min(
    sortedTasks.length - 1,
    Math.floor((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_ROWS
  );

  const visibleTasks = sortedTasks.slice(startIndex, endIndex + 1);
  const totalHeight = sortedTasks.length * ROW_HEIGHT;
  const offsetY = startIndex * ROW_HEIGHT;

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown size={14} className="text-slate-600" />;
    return sortDir === 'asc' ? <ArrowUp size={14} className="text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-400" />;
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <p className="mb-4">No tasks match your filters.</p>
        <button 
          onClick={() => useStore.getState().setFilters({ status: [], priority: [], assignees: [], dateRange: { from: null, to: null } })}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr,1fr,150px,150px] gap-4 px-6 py-4 bg-slate-800 border-b border-slate-700 font-semibold text-slate-300 shadow-sm z-10 sticky top-0">
        <div className="cursor-pointer flex items-center gap-2 hover:text-white transition" onClick={() => handleSort('title')}>
          Title <SortIcon columnKey="title" />
        </div>
        <div className="cursor-pointer flex items-center gap-2 hover:text-white transition" onClick={() => handleSort('priority')}>
          Priority <SortIcon columnKey="priority" />
        </div>
        <div className="cursor-pointer flex items-center gap-2 hover:text-white transition" onClick={() => handleSort('dueDate')}>
          Due Date <SortIcon columnKey="dueDate" />
        </div>
        <div>Status</div>
      </div>

      {/* Virtual Table Body */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto"
      >
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', top: 0, left: 0, right: 0 }}>
            {visibleTasks.map(task => (
              <div 
                key={task.id} 
                className="grid grid-cols-[2fr,1fr,150px,150px] gap-4 px-6 items-center border-b border-slate-800/60 hover:bg-slate-800/40 transition"
                style={{ height: ROW_HEIGHT }}
              >
                <div className="font-medium text-slate-200 truncate">{task.title}</div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded font-bold ${
                    task.priority === 'Critical' ? 'bg-red-500 text-white' :
                    task.priority === 'High' ? 'bg-orange-500 text-white' :
                    task.priority === 'Medium' ? 'bg-amber-500 text-slate-900' :
                    'bg-emerald-500 text-slate-900'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
                <div>
                  <select 
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none w-full"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
