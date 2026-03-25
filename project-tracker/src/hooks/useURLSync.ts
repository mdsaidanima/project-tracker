import { useEffect } from 'react';
import { useStore } from '../store/store';
import { FilterState, Priority, Status } from '../types';

export function useURLSync() {
  const filters = useStore((state) => state.filters);
  const setFilters = useStore((state) => state.setFilters);
  const view = useStore((state) => state.view);
  const setView = useStore((state) => state.setView);

  // Sync URL to Store (on initial load and popstate)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      
      const statusParam = params.get('status');
      const priorityParam = params.get('priority');
      const assigneesParam = params.get('assignees');
      const fromParam = params.get('from');
      const toParam = params.get('to');
      const viewParam = params.get('view');

      if (viewParam === 'kanban' || viewParam === 'list' || viewParam === 'timeline') {
        setView(viewParam);
      }

      const newFilters: Partial<FilterState> = {
        status: statusParam ? (statusParam.split(',') as Status[]) : [],
        priority: priorityParam ? (priorityParam.split(',') as Priority[]) : [],
        assignees: assigneesParam ? assigneesParam.split(',') : [],
        dateRange: {
          from: fromParam || null,
          to: toParam || null,
        }
      };

      setFilters(newFilters);
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setFilters, setView]);

  // Sync Store to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (filters.status.length > 0) params.set('status', filters.status.join(','));
    else params.delete('status');

    if (filters.priority.length > 0) params.set('priority', filters.priority.join(','));
    else params.delete('priority');

    if (filters.assignees.length > 0) params.set('assignees', filters.assignees.join(','));
    else params.delete('assignees');

    if (filters.dateRange.from) params.set('from', filters.dateRange.from);
    else params.delete('from');

    if (filters.dateRange.to) params.set('to', filters.dateRange.to);
    else params.delete('to');

    params.set('view', view);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (newUrl !== window.location.pathname + window.location.search) {
      window.history.pushState({}, '', newUrl);
    }
  }, [filters, view]);
}
