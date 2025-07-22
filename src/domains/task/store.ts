import { singleton} from 'tsyringe';
import { TaskModel } from './model';
import { TaskStatus } from './types';
import { Op } from 'sequelize';
import logger from '../../utils/logger';
import { ensureTestEnvironment } from '../../utils/environment';

@singleton()
export class TaskStore {
  async createTask(
    title: string,
    description: string,
    userId: string,
    status: TaskStatus = TaskStatus.TODO
  ): Promise<TaskModel> {
    try {
      const task = await TaskModel.create({
        title,
        description,
        status,
        userId,
      });

      logger.info(`Task created: ${task.id} for user ${userId}`);
      return task;
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  async findTaskById(id: string): Promise<TaskModel | null> {
    try {
      return await TaskModel.findByPk(id);
    } catch (error) {
      logger.error('Error finding task by ID:', error);
      throw error;
    }
  }

  async findTasksByUserId(userId: string, status?: TaskStatus): Promise<TaskModel[]> {
    try {
      const whereClause: { userId: string; status?: TaskStatus } = { userId };

      if (status) {
        whereClause.status = status;
      }

      return await TaskModel.findAll({
        where: whereClause,
        order: [['updatedAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Error finding tasks by user ID:', error);
      throw error;
    }
  }

  async updateTask(
    id: string,
    updates: Partial<Pick<TaskModel, 'title' | 'description' | 'status'>>
  ): Promise<TaskModel | null> {
    try {
      const [updatedCount, updatedTasks] = await TaskModel.update(updates, {
        where: { id },
        returning: true,
      });

      if (updatedCount === 0) {
        return null;
      }

      logger.info(`Task updated: ${id}`);
      return updatedTasks[0];
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const deletedCount = await TaskModel.destroy({
        where: { id },
      });

      const deleted = deletedCount > 0;
      if (deleted) {
        logger.info(`Task deleted: ${id}`);
      }

      return deleted;
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw error;
    }
  }

  async getTaskCountsByStatus(userId: string): Promise<Record<TaskStatus, number>> {
    try {
      const tasks = await TaskModel.findAll({
        where: { userId },
        attributes: ['status'],
      });

      const counts: Record<TaskStatus, number> = {
        [TaskStatus.TODO]: 0,
        [TaskStatus.IN_PROGRESS]: 0,
        [TaskStatus.DONE]: 0,
        [TaskStatus.ARCHIVED]: 0,
      };

      tasks.forEach((task: TaskModel) => {
        counts[task.status]++;
      });

      return counts;
    } catch (error) {
      logger.error('Error getting task counts:', error);
      throw error;
    }
  }

  async searchTasks(userId: string, searchTerm: string): Promise<TaskModel[]> {
    try {
      return await TaskModel.findAll({
        where: {
          userId,
          [Op.or]: [
            { title: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
        order: [['updatedAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Error searching tasks:', error);
      throw error;
    }
  }

  // For testing purposes - only allow in test environment
  async clear(): Promise<void> {
    ensureTestEnvironment();
    try {
      await TaskModel.destroy({ where: {} });
      logger.info('Task data cleared');
    } catch (error) {
      logger.error('Error clearing task data:', error);
      throw error;
    }
  }
}
