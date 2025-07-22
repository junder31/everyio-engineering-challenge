import { singleton } from 'tsyringe';
import { UserStore } from './store';
import { hashPassword, comparePassword, generateToken } from '../../utils/auth';
import { GraphQLError } from 'graphql';
import logger from '../../utils/logger';
import type { User, AuthPayload, RegisterInput, LoginInput } from './types';

@singleton()
export class UserService {
  constructor(private userStore: UserStore) {}
  /**
   * Register a new user
   */
  async registerUser(input: RegisterInput): Promise<AuthPayload> {
    // Check if user already exists
    const existingUser = await this.userStore.findUserByEmail(input.email);
    if (existingUser) {
      throw new GraphQLError('User already exists with this email', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(input.password);
    const user = await this.userStore.createUser(input.username, input.email, hashedPassword);

    // Generate token
    const token = generateToken(user.id);

    logger.info(`New user registered: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Login user with email and password
   */
  async loginUser(input: LoginInput): Promise<AuthPayload> {
    // Find user by email
    const user = await this.userStore.findUserByEmail(input.email);
    if (!user) {
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(input.password, user.password);
    if (!isValidPassword) {
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Generate token
    const token = generateToken(user.id);

    logger.info(`User logged in: ${user.email}`);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.userStore.findUserById(userId);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userStore.findUserByEmail(email);
  }
}
