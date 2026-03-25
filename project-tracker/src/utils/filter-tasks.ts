import { Task, FilterState } from '../types';

export function filterTasks(tasks: Task[], filters: FilterState): Task[] {
  return tasks.filter(task => {
    // Status
    if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
    
    // Priority
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
    
    // Assignee
    // If we select a user, tasks without assignee fail.
    // What if we want unassigned tasks? Assuming we select users.
    if (filters.assignees.length > 0) {
      if (!task.assigneeId || !filters.assignees.includes(task.assigneeId)) return false;
    }

    // Date Range
    if (filters.dateRange.from) {
      if (!task.dueDate || new Date(task.dueDate) < new Date(filters.dateRange.from)) return false;
    }
    if (filters.dateRange.to) {
      if (!task.dueDate || new Date(task.dueDate) > new Date(filters.dateRange.to)) return false;
    }

    return true;
  });
}
