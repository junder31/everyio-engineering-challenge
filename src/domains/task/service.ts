import { singleton } from 'tsyringe';
import { TaskStore } from './store';
import {
  TaskStatus,
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
  type UpdateTaskStatusInput,
} from './types';
import { GraphQLError } from 'graphql';
import logger from '../../utils/logger';

@singleton()
export class TaskService {
  constructor(private taskStore: TaskStore) {}
  /**
   * Get all tasks for a user
   */
  async getUserTasks(userId: string): Promise<Task[]> {
    logger.info(`User ${userId} fetching tasks`);
    return await this.taskStore.findTasksByUserId(userId);
  }

  /**
   * Get a specific task by ID for a user
   */
  async getUserTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskStore.findTaskById(taskId);

    if (!task) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (task.userId !== userId) {
      throw new GraphQLError('Not authorized to view this task', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    return task;
  }

  /**
   * Create a new task for a user
   */
  async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    const task = await this.taskStore.createTask(
      input.title,
      input.description,
      userId,
      input.status || TaskStatus.TODO
    );

    logger.info(`Task created: ${task.id} by user ${userId}`);
    return task;
  }

  /**
   * Update task content (title and description only)
   */
  async updateTask(input: UpdateTaskInput, userId: string): Promise<Task> {
    const existingTask = await this.taskStore.findTaskById(input.id);

    if (!existingTask) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (existingTask.userId !== userId) {
      throw new GraphQLError('Not authorized to update this task', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const updatedTask = await this.taskStore.updateTask(input.id, {
      title: input.title,
      description: input.description,
    });

    if (!updatedTask) {
      throw new GraphQLError('Failed to update task', {
        extensions: { code: 'INTERNAL_ERROR' },
      });
    }

    logger.info(`Task updated: ${input.id} by user ${userId}`);
    return updatedTask;
  }

  /**
   * Update task status (excluding ARCHIVED status)
   */
  async updateTaskStatus(input: UpdateTaskStatusInput, userId: string): Promise<Task> {
    const existingTask = await this.taskStore.findTaskById(input.id);

    if (!existingTask) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (existingTask.userId !== userId) {
      throw new GraphQLError('Not authorized to update this task status', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    // Prevent archiving tasks through this endpoint - use archiveTask instead
    if (input.status === TaskStatus.ARCHIVED) {
      throw new GraphQLError(
        'Cannot archive tasks using updateTaskStatus. Use archiveTask mutation instead.',
        {
          extensions: { code: 'BAD_USER_INPUT' },
        }
      );
    }

    const updatedTask = await this.taskStore.updateTask(input.id, {
      status: input.status,
    });

    if (!updatedTask) {
      throw new GraphQLError('Failed to update task status', {
        extensions: { code: 'INTERNAL_ERROR' },
      });
    }

    logger.info(`Task status updated: ${input.id} to ${input.status} by user ${userId}`);
    return updatedTask;
  }

  /**
   * Archive a task (set status to ARCHIVED)
   */
  async archiveTask(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskStore.findTaskById(taskId);

    if (!task) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (task.userId !== userId) {
      throw new GraphQLError('Not authorized to archive this task', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const archivedTask = await this.taskStore.updateTask(taskId, { status: TaskStatus.ARCHIVED });

    if (!archivedTask) {
      throw new GraphQLError('Failed to archive task', {
        extensions: { code: 'INTERNAL_ERROR' },
      });
    }

    logger.info(`Task archived: ${taskId} by user ${userId}`);
    return archivedTask;
  }

  /**
   * Get task counts by status for a user
   */
  async getTaskCountsByStatus(userId: string): Promise<Record<TaskStatus, number>> {
    return await this.taskStore.getTaskCountsByStatus(userId);
  }

  /**
   * Search tasks for a user
   */
  async searchUserTasks(userId: string, searchTerm: string): Promise<Task[]> {
    return await this.taskStore.searchTasks(userId, searchTerm);
  }
}

