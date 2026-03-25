import React from 'react';
import { useStore } from '../store/store';
import { USERS } from '../utils/data-generator';
import { LayoutGrid, List, Calendar } from 'lucide-react';

export const Header: React.FC = () => {
  const view = useStore((state) => state.view);
  const setView = useStore((state) => state.setView);
  const activeUsers = useStore((state) => state.activeUsers);

  // Map active users to user objects
  const activeCollaborators = activeUsers.map(a => USERS.find(u => u.id === a.userId)).filter(Boolean);

  return (
    <header className="flex flex-col md:flex-row justify-between items-center bg-slate-800 p-4 border-b border-slate-700">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-white">
            <LayoutGrid size={18} />
          </div>
          Project Tracker
        </h1>
        
        {/* Collaboration Indicator */}
        {activeCollaborators.length > 0 && (
          <div className="flex items-center gap-2 ml-6 bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600 text-sm">
            <div className="flex -space-x-2">
              {activeCollaborators.map((u, i) => (
                <div 
                  key={i} 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-800"
                  style={{ backgroundColor: u?.color }}
                  title={`${u?.name} is online`}
                >
                  {u?.avatar}
                </div>
              ))}
            </div>
            <span className="text-slate-300 text-xs font-medium">{activeCollaborators.length} people viewing</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-700">
        <button
          onClick={() => setView('kanban')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <LayoutGrid size={16} /> <span className="hidden sm:inline">Board</span>
        </button>
        <button
          onClick={() => setView('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <List size={16} /> <span className="hidden sm:inline">List</span>
        </button>
        <button
          onClick={() => setView('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${view === 'timeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <Calendar size={16} /> <span className="hidden sm:inline">Timeline</span>
        </button>
      </div>
    </header>
  );
};
