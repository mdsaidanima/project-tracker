import React from 'react';
import { useStore } from './store/store';
import { useURLSync } from './hooks/useURLSync';
import { useCollaboration } from './hooks/useCollaboration';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { TimelineView } from './components/TimelineView';

function App() {
  const view = useStore((state) => state.view);
  
  // Custom hooks
  useURLSync();
  useCollaboration();

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden font-sans">
      <Header />
      <FilterBar />
      
      <main className="flex-1 overflow-hidden relative">
        {view === 'kanban' && <KanbanBoard />}
        {view === 'list' && <ListView />}
        {view === 'timeline' && <TimelineView />}
      </main>
    </div>
  );
}

export default App;
