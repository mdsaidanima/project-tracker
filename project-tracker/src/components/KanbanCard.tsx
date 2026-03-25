import React from 'react';
import { Task } from '../types';
import { USERS } from '../utils/data-generator';
import { useStore } from '../store/store';
import { Calendar, AlertCircle } from 'lucide-react';

interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, isDragging }) => {
  const activeUsers = useStore(state => state.activeUsers);
  
  const assignee = USERS.find(u => u.id === task.assigneeId);
  const activeCollabs = activeUsers.filter(a => a.taskId === task.id).map(a => USERS.find(u => u.id === a.userId)).filter(Boolean);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-amber-500 text-slate-900';
      case 'Low': return 'bg-emerald-500 text-slate-900';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getDueDateDisplay = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Due Today', color: 'text-amber-500', over: false };
    if (diffDays > 0) {
      if (diffDays > 7) return { text: `${diffDays} days overdue`, color: 'text-red-500 font-bold', over: true };
      return { text: 'Overdue', color: 'text-red-500', over: true };
    }
    
    return { 
      text: dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
      color: 'text-slate-400', 
      over: false 
    };
  };

  const dueInfo = getDueDateDisplay(task.dueDate);

  return (
    <div className={`p-4 rounded-lg bg-slate-800 border border-slate-700 shadow-sm relative group cursor-grab touch-none ${isDragging ? 'opacity-50 ring-2 ring-indigo-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        
        {activeCollabs.length > 0 && (
          <div className="flex -space-x-1 absolute -top-2 -right-2">
            {activeCollabs.map((u, i) => (
              <div 
                key={i} 
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-slate-700 shadow-md animate-bounce"
                style={{ backgroundColor: u?.color }}
                title={`${u?.name} is viewing`}
              >
                {u?.avatar}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <h3 className="text-sm font-semibold text-white mb-3 leading-tight">{task.title}</h3>
      
      <div className="flex justify-between items-end mt-4">
        <div className={`flex items-center gap-1 text-xs ${dueInfo.color}`}>
          {dueInfo.over ? <AlertCircle size={12} /> : <Calendar size={12} />}
          <span>{dueInfo.text}</span>
        </div>
        
        {assignee ? (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: assignee.color }}
            title={assignee.name}
          >
            {assignee.avatar}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-slate-500 bg-slate-700 border border-dashed border-slate-600" title="Unassigned">
            ?
          </div>
        )}
      </div>
    </div>
  );
};
