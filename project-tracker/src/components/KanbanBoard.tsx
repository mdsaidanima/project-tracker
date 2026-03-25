import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { filterTasks } from '../utils/filter-tasks';
import { KanbanCard } from './KanbanCard';
import { Task, Status } from '../types';

const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

export const KanbanBoard: React.FC = () => {
  const storeTasks = useStore(state => state.tasks);
  const filters = useStore(state => state.filters);
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  
  const tasks = filterTasks(storeTasks, filters);

  // Group tasks
  const columns: Record<Status, Task[]> = {
    'To Do': [],
    'In Progress': [],
    'In Review': [],
    'Done': []
  };

  tasks.forEach(t => {
    if (columns[t.status]) columns[t.status].push(t);
  });

  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeColumn, setActiveColumn] = useState<Status | null>(null);
  const [placeholderRect, setPlaceholderRect] = useState<{ width: number, height: number, sourceCol: Status } | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapStyle, setSnapStyle] = useState({});

  const boardRef = useRef<HTMLDivElement>(null);
  const originalCardRef = useRef<HTMLElement | null>(null);

  const startDrag = (e: React.PointerEvent, task: Task) => {
    e.preventDefault();
    if (e.button !== 0 && e.pointerType === 'mouse') return; // only left click

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    setDragPos({ x: e.clientX, y: e.clientY });
    setDraggedTask(task);
    setActiveColumn(task.status);
    setPlaceholderRect({ width: rect.width, height: rect.height, sourceCol: task.status });
    
    // Lock scrolling on mobile when dragging
    document.body.style.overflow = 'hidden';
  };

  useEffect(() => {
    if (!draggedTask && !isSnapping) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      if (!draggedTask) return;

      setDragPos({ x: e.clientX, y: e.clientY });

      // Find drop target
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const columnEl = elements.find(el => el.hasAttribute('data-column'));
      
      if (columnEl) {
        const colStatus = columnEl.getAttribute('data-column') as Status;
        if (colStatus !== activeColumn) {
          setActiveColumn(colStatus);
        }
      } else {
        setActiveColumn(null);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!draggedTask) return;
      document.body.style.overflow = '';

      // Check if we dropped on a valid column
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const columnEl = elements.find(el => el.hasAttribute('data-column'));

      if (columnEl) {
        const newStatus = columnEl.getAttribute('data-column') as Status;
        // Successfully dropped
        if (newStatus !== draggedTask.status) {
          updateTaskStatus(draggedTask.id, newStatus);
        }
        
        // Reset immediately
        setDraggedTask(null);
        setActiveColumn(null);
        setPlaceholderRect(null);
      } else {
        // Snap back!
        setIsSnapping(true);
        setActiveColumn(null);
        
        // Let's get original position approximately if possible, or just the mouse point minus offset
        setSnapStyle({
          transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)',
          transform: 'scale(1)',
          opacity: 0,
          left: `${dragPos.x - dragOffset.x}px`,
          top: `${dragPos.y - dragOffset.y}px`
        });

        // Use requestAnimationFrame to let CSS transition happen
        requestAnimationFrame(() => {
          // Send back to center of screen or disappear slowly
          setSnapStyle(prev => ({ ...prev, opacity: 0, transform: 'scale(0.8)' }));
          
          setTimeout(() => {
            setDraggedTask(null);
            setPlaceholderRect(null);
            setIsSnapping(false);
            setSnapStyle({});
          }, 300);
        });
      }
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggedTask, activeColumn, dragPos.x, dragPos.y, dragOffset.x, dragOffset.y, updateTaskStatus, isSnapping]);

  return (
    <div className="h-full p-6 flex gap-6 overflow-x-auto" ref={boardRef} style={{ touchAction: draggedTask ? 'none' : 'auto' }}>
      {STATUSES.map(status => (
        <div 
          key={status} 
          data-column={status}
          className={`flex-1 min-w-[300px] flex flex-col bg-slate-900 rounded-xl border-2 transition-colors ${
            activeColumn === status ? 'border-indigo-500 bg-slate-800/50' : 'border-slate-800'
          }`}
        >
          {/* Column Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-800 sticky top-0 z-10 bg-slate-900/95 rounded-t-xl backdrop-blur">
            <h2 className="font-semibold text-slate-200">{status}</h2>
            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-400">
              {columns[status].length}
            </span>
          </div>

          {/* Column Body */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 min-h-[150px]">
            {columns[status].length === 0 && !draggedTask && (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-700/50 rounded-lg text-slate-500 text-sm">
                No tasks
              </div>
            )}
            
            {columns[status].map(task => (
              <React.Fragment key={task.id}>
                {draggedTask?.id === task.id ? (
                  // Placeholder for dragged task
                  <div 
                    className="rounded-lg border-2 border-dashed border-indigo-500/50 bg-indigo-500/5 transition-all"
                    style={{ height: placeholderRect?.height }}
                  />
                ) : (
                  <div 
                    onPointerDown={(e) => startDrag(e, task)}
                    className="touch-none select-none"
                  >
                    <KanbanCard task={task} />
                  </div>
                )}
              </React.Fragment>
            ))}
            
            {/* If hovering over empty column or bottom of column */}
            {activeColumn === status && draggedTask && placeholderRect?.sourceCol !== status && (
               <div 
                  className="rounded-lg border-2 border-dashed border-indigo-500/50 bg-indigo-500/5 transition-all mt-auto"
                  style={{ height: placeholderRect?.height }}
               />
            )}
          </div>
        </div>
      ))}

      {/* Portal/Overlay for the dragged item */}
      {(draggedTask || isSnapping) && (
        <div
          className="fixed pointer-events-none z-50 rounded-lg shadow-2xl overflow-hidden will-change-transform"
          style={isSnapping ? snapStyle : {
            left: dragPos.x - dragOffset.x,
            top: dragPos.y - dragOffset.y,
            width: placeholderRect?.width,
            transform: 'rotate(2deg)',
            opacity: 0.9,
            cursor: 'grabbing'
          }}
        >
          {draggedTask && <KanbanCard task={draggedTask} isDragging={true} />}
        </div>
      )}
    </div>
  );
};
