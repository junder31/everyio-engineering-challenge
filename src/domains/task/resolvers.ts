import { TaskService } from './service';
import type { Task, CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from './types';
import type { Context } from '../user/types';
import { container } from 'tsyringe';
import AuthenticatedAction from '../../graphql/authenticated-action';

const taskService = container.resolve(TaskService);

export const taskResolvers = {
  Query: {
    tasks: AuthenticatedAction(
      async (_: unknown, __: unknown, context: Context, user): Promise<Task[]> => {
        return await taskService.getUserTasks(user.id);
      }
    ),

    task: AuthenticatedAction(
      async (_: unknown, { id }: { id: string }, context: Context, user): Promise<Task> => {
        return await taskService.getUserTask(id, user.id);
      }
    ),
  },

  Mutation: {
    createTask: AuthenticatedAction(
      async (
        _: unknown,
        { input }: { input: CreateTaskInput },
        context: Context,
        user
      ): Promise<Task> => {
        return await taskService.createTask(input, user.id);
      }
    ),

    updateTask: AuthenticatedAction(
      async (
        _: unknown,
        { input }: { input: UpdateTaskInput },
        context: Context,
        user
      ): Promise<Task> => {
        return await taskService.updateTask(input, user.id);
      }
    ),

    archiveTask: AuthenticatedAction(
      async (_: unknown, { id }: { id: string }, context: Context, user): Promise<Task> => {
        return await taskService.archiveTask(id, user.id);
      }
    ),

    updateTaskStatus: AuthenticatedAction(
      async (
        _: unknown,
        { input }: { input: UpdateTaskStatusInput },
        context: Context,
        user
      ): Promise<Task> => {
        return await taskService.updateTaskStatus(input, user.id);
      }
    ),
  },
};
