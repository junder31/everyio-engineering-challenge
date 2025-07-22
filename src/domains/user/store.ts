import {injectable, singleton} from 'tsyringe';
import { UserModel } from './model';
import logger from '../../utils/logger';
import { ensureTestEnvironment } from '../../utils/environment';

@singleton()
export class UserStore {
  async createUser(username: string, email: string, hashedPassword: string): Promise<UserModel> {
    try {
      const user = await UserModel.create({
        username,
        email,
        password: hashedPassword,
      });

      logger.info(`User created: ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserModel | null> {
    try {
      return await UserModel.findOne({
        where: { email },
      });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findUserById(id: string): Promise<UserModel | null> {
    try {
      return await UserModel.findByPk(id);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // For testing purposes - only allow in test environment
  async clear(): Promise<void> {
    ensureTestEnvironment();
    
    try {
      await UserModel.destroy({ where: {} });
      logger.info('User data cleared');
    } catch (error) {
      logger.error('Error clearing user data:', error);
      throw error;
    }
  }
}
