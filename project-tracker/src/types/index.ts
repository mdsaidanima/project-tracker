export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export interface User {
  id: string;
  name: string;
  avatar: string; // Initials
  color: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string | null;
  priority: Priority;
  status: Status;
  startDate: string | null; // ISO Date String (YYYY-MM-DD)
  dueDate: string; // ISO Date String (YYYY-MM-DD)
}

export interface FilterState {
  searchStr: string;
  status: Status[];
  priority: Priority[];
  assignees: string[];
  dateRange: {
    from: string | null;
    to: string | null;
  };
}

export interface ActiveUser {
  userId: string;
  taskId: string | null; 
}
