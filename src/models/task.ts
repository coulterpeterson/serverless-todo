export interface Task {
    taskId: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    createdAt: string;  
    updatedAt: string;
}

export type TaskInput = Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>;
export type TaskUpdate = Partial<Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>>;