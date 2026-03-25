import { Task, User, Priority, Status } from '../types';

export const USERS: User[] = [
  { id: 'u1', name: 'Alice Adams', avatar: 'AA', color: '#ef4444' },
  { id: 'u2', name: 'Bob Baker', avatar: 'BB', color: '#f97316' },
  { id: 'u3', name: 'Charlie Clark', avatar: 'CC', color: '#f59e0b' },
  { id: 'u4', name: 'Diana Davis', avatar: 'DD', color: '#84cc16' },
  { id: 'u5', name: 'Evan Evans', avatar: 'EE', color: '#06b6d4' },
  { id: 'u6', name: 'Fiona Fox', avatar: 'FF', color: '#8b5cf6' },
];

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

const VERBS = ['Implement', 'Fix', 'Update', 'Review', 'Refactor', 'Design', 'Test', 'Deploy', 'Optimize', 'Document'];
const NOUNS = ['API', 'Database', 'Component', 'Module', 'Tests', 'UI', 'Dashboard', 'Login Page', 'Settings', 'Workflow'];
const ADJECTIVES = ['Async', 'Main', 'Secondary', 'Legacy', 'New', 'Critical', 'Secure', 'Responsive', 'Dynamic', 'Static'];

export function generateTasks(count: number): Task[] {
  const tasks: Task[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
    const user = Math.random() > 0.1 ? USERS[Math.floor(Math.random() * USERS.length)].id : null;
    
    const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const title = `${verb} ${adjective} ${noun}`;

    // Dates
    const startOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const duration = Math.floor(Math.random() * 14) + 1; // 1 to 14 days
    
    const startDateObj = new Date(today);
    startDateObj.setDate(today.getDate() + startOffset);
    
    const dueDateObj = new Date(startDateObj);
    dueDateObj.setDate(startDateObj.getDate() + duration);

    // Some tasks don't have start date
    const hasStartDate = Math.random() > 0.2;

    const startDate = hasStartDate ? startDateObj.toISOString().split('T')[0] : null;
    const dueDate = dueDateObj.toISOString().split('T')[0];

    tasks.push({
      id: `task-${i + 1}`,
      title,
      assigneeId: user,
      priority,
      status,
      startDate,
      dueDate,
    });
  }

  return tasks;
}

export const initialTasks = generateTasks(500);
