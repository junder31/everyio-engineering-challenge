export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ARCHIVED = 'ARCHIVED',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
}

export interface UpdateTaskStatusInput {
  id: string;
  status: TaskStatus;
}
