import React from 'react';
import { useStore } from '../store/store';
import { FilterState, Priority, Status } from '../types';
import { USERS } from '../utils/data-generator';
import { X } from 'lucide-react';

const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];
const PRIORITIES: Priority[] = ['Critical', 'High', 'Medium', 'Low'];

export const FilterBar: React.FC = () => {
  const filters = useStore((state) => state.filters);
  const setFilters = useStore((state) => state.setFilters);

  const toggleStatus = (status: Status) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    setFilters({ status: newStatuses });
  };

  const togglePriority = (priority: Priority) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    setFilters({ priority: newPriorities });
  };

  const toggleAssignee = (userId: string) => {
    const newAssignees = filters.assignees.includes(userId)
      ? filters.assignees.filter(id => id !== userId)
      : [...filters.assignees, userId];
    setFilters({ assignees: newAssignees });
  };

  const hasActiveFilters = filters.status.length > 0 || filters.priority.length > 0 || filters.assignees.length > 0 || filters.dateRange.from || filters.dateRange.to;

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      assignees: [],
      dateRange: { from: null, to: null }
    });
  };

  return (
    <div className="bg-slate-800 p-4 border-b border-slate-700 flex flex-wrap gap-4 items-center rounded-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400 font-medium">Status:</span>
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`px-3 py-1 rounded text-xs border transition-colors ${filters.status.includes(s) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400 font-medium">Priority:</span>
        <div className="flex gap-1">
          {PRIORITIES.map(p => (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={`px-3 py-1 rounded text-xs border transition-colors ${filters.priority.includes(p) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400 font-medium">Assignee:</span>
        <div className="flex gap-1 flex-wrap max-w-[200px] sm:max-w-none">
          {USERS.map(u => (
            <button
              key={u.id}
              onClick={() => toggleAssignee(u.id)}
              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 transition-transform ${filters.assignees.includes(u.id) ? 'scale-110 border-indigo-500 z-10' : 'border-transparent opacity-70 hover:opacity-100'}`}
              style={{ backgroundColor: u.color }}
              title={u.name}
            >
              {u.avatar}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white px-3 py-1 rounded hover:bg-slate-700 transition"
          >
            <X size={14} /> Clear All
          </button>
        )}
      </div>
    </div>
  );
};
