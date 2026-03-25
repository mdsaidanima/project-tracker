import { useEffect } from 'react';
import { useStore } from '../store/store';
import { USERS } from '../utils/data-generator';
import { ActiveUser } from '../types';

export function useCollaboration() {
  const updateActiveUsers = useStore((state) => state.updateActiveUsers);
  const tasks = useStore((state) => state.tasks);

  useEffect(() => {
    // Pick 3 random users to be "active"
    const shuffled = [...USERS].sort(() => 0.5 - Math.random());
    const activeCollabs = shuffled.slice(0, 3).map((u) => ({
      userId: u.id,
      taskId: tasks.length ? tasks[Math.floor(Math.random() * tasks.length)].id : null,
    }));

    updateActiveUsers(activeCollabs);

    const interval = setInterval(() => {
      // Pick a random active user and move them to a new task
      const userToMoveIdx = Math.floor(Math.random() * activeCollabs.length);
      activeCollabs[userToMoveIdx] = {
        ...activeCollabs[userToMoveIdx],
        taskId: tasks.length ? tasks[Math.floor(Math.random() * tasks.length)].id : null,
      };

      updateActiveUsers([...activeCollabs]);
    }, 4000); // every 4 seconds someone moves

    return () => clearInterval(interval);
  }, [updateActiveUsers, tasks.length]); // only run when tasks length changes (initially)
}
