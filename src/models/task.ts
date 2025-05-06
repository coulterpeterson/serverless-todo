export const TASK_STATUSES = ['pending', 'in-progress', 'completed'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

export interface Task {
    taskId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    createdAt: string;  
    updatedAt: string;
}

export type TaskInput = Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>;
export type TaskUpdate = Partial<Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>>;