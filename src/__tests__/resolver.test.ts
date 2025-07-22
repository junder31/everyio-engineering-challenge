import { resolvers } from '../graphql/resolvers';
import { connectDatabase, closeDatabase } from '../config/database';
import { GraphQLError } from 'graphql';
import { Context, UserStore } from '../domains/user';
import { TaskStatus, TaskStore } from '../domains/task';
import { container } from 'tsyringe';

describe('GraphQL Resolvers', () => {
  let mockContext: Context;
  let testId: string;
  const taskStore = container.resolve(TaskStore);
  const userStore = container.resolve(UserStore);

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    await connectDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await userStore.clear();
    await taskStore.clear();

    // Generate unique test ID for this test run
    testId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Create a test user for context with unique email
    const user = await userStore.createUser(
      `testuser_${testId}`,
      `test_${testId}@example.com`,
      'hashedpassword'
    );
    mockContext = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  });

  describe('Task Queries', () => {
    it('should return tasks for authenticated user', async () => {
      // Create a task for the user
      await taskStore.createTask('Test Task', 'Description', mockContext.user!.id);

      const result = await resolvers.Query.tasks(null, {}, mockContext);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Task');
      expect(result[0].userId).toBe(mockContext.user!.id);
    });

    it('should throw error for unauthenticated user', async () => {
      const unauthenticatedContext: Context = {};

      expect(() => resolvers.Query.tasks(null, {}, unauthenticatedContext)).toThrow(GraphQLError);
    });

    it('should return specific task for authorized user', async () => {
      const task = await taskStore.createTask('Test Task', 'Description', mockContext.user!.id);

      const result = await resolvers.Query.task(null, { id: task.id }, mockContext);

      expect(result).toBeDefined();
      expect(result?.id).toBe(task.id);
      expect(result?.userId).toBe(mockContext.user!.id);
    });

    it("should throw error when accessing other user's task", async () => {
      // Create another user and their task
      const otherUser = await userStore.createUser(
        `otheruser_${testId}`,
        `other_${testId}@example.com`,
        'password'
      );
      const task = await taskStore.createTask('Other User Task', 'Description', otherUser.id);

      await expect(resolvers.Query.task(null, { id: task.id }, mockContext)).rejects.toThrow(
        'Not authorized to view this task'
      );
    });
  });

  describe('Task Mutations', () => {
    it('should create new task', async () => {
      const input = {
        title: 'New Task',
        description: 'Task description',
        status: TaskStatus.TODO,
      };

      const result = await resolvers.Mutation.createTask(null, { input }, mockContext);

      expect(result.title).toBe('New Task');
      expect(result.description).toBe('Task description');
      expect(result.status).toBe(TaskStatus.TODO);
      expect(result.userId).toBe(mockContext.user!.id);
    });

    it('should update existing task (excluding status)', async () => {
      const task = await taskStore.createTask(
        'Original Title',
        'Original Description',
        mockContext.user!.id
      );
      const input = {
        id: task.id,
        title: 'Updated Title',
      };

      const result = await resolvers.Mutation.updateTask(null, { input }, mockContext);

      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe(TaskStatus.TODO); // Status should remain unchanged
      expect(result.description).toBe('Original Description'); // Should remain unchanged
    });

    it('should update task status using updateTaskStatus', async () => {
      const task = await taskStore.createTask(
        'Task for Status Update',
        'Description',
        mockContext.user!.id
      );
      const input = {
        id: task.id,
        status: TaskStatus.IN_PROGRESS,
      };

      const result = await resolvers.Mutation.updateTaskStatus(null, { input }, mockContext);

      expect(result.title).toBe('Task for Status Update'); // Title should remain unchanged
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.description).toBe('Description'); // Description should remain unchanged
    });

    it('should prevent unauthorized status updates', async () => {
      // Create another user and their task
      const otherUser = await userStore.createUser(
        `otheruser_status_${testId}`,
        `other_status_${testId}@example.com`,
        'password'
      );
      const task = await taskStore.createTask('Other User Task', 'Description', otherUser.id);

      // Try to update other user's task status
      await expect(
        resolvers.Mutation.updateTaskStatus(
          null,
          { input: { id: task.id, status: TaskStatus.IN_PROGRESS } },
          mockContext
        )
      ).rejects.toThrow('Not authorized to update this task status');
    });

    it('should prevent archiving tasks through updateTaskStatus', async () => {
      const task = await taskStore.createTask(
        'Task for Archive Prevention Test',
        'Description',
        mockContext.user!.id
      );

      // Try to archive task through updateTaskStatus - should fail
      await expect(
        resolvers.Mutation.updateTaskStatus(
          null,
          { input: { id: task.id, status: TaskStatus.ARCHIVED } },
          mockContext
        )
      ).rejects.toThrow(
        'Cannot archive tasks using updateTaskStatus. Use archiveTask mutation instead.'
      );

      // Verify task is still not archived
      const unchangedTask = await taskStore.findTaskById(task.id);
      expect(unchangedTask?.status).toBe(TaskStatus.TODO);
    });

    it('should archive task', async () => {
      const task = await taskStore.createTask(
        'Task to Archive',
        'Description',
        mockContext.user!.id
      );

      const result = await resolvers.Mutation.archiveTask(null, { id: task.id }, mockContext);

      expect(result.status).toBe(TaskStatus.ARCHIVED);
      expect(result.id).toBe(task.id);
    });

    it('should prevent unauthorized task operations', async () => {
      // Create another user and their task
      const otherUser = await userStore.createUser(
        `otheruser2_${testId}`,
        `other2_${testId}@example.com`,
        'password'
      );
      const task = await taskStore.createTask('Other User Task', 'Description', otherUser.id);

      // Try to update other user's task
      await expect(
        resolvers.Mutation.updateTask(
          null,
          { input: { id: task.id, title: 'Hacked' } },
          mockContext
        )
      ).rejects.toThrow('Not authorized to update this task');

      // Try to archive other user's task
      await expect(
        resolvers.Mutation.archiveTask(null, { id: task.id }, mockContext)
      ).rejects.toThrow('Not authorized to archive this task');
    });
  });

  describe('Authentication Mutations', () => {
    it('should register new user', async () => {
      const input = {
        username: `newuser_${testId}`,
        email: `newuser_${testId}@example.com`,
        password: 'password123',
      };

      const result = await resolvers.Mutation.register(null, { input });

      expect(result.token).toBeDefined();
      expect(result.user.username).toBe(`newuser_${testId}`);
      expect(result.user.email).toBe(`newuser_${testId}@example.com`);
      expect(result.user.id).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      const input = {
        username: `user1_${testId}`,
        email: `duplicate_${testId}@example.com`,
        password: 'password123',
      };

      // Register first user
      await resolvers.Mutation.register(null, { input });

      // Try to register with same email
      const duplicateInput = {
        username: `user2_${testId}`,
        email: `duplicate_${testId}@example.com`,
        password: 'different123',
      };

      await expect(resolvers.Mutation.register(null, { input: duplicateInput })).rejects.toThrow(
        'User already exists with this email'
      );
    });

    it('should login with valid credentials', async () => {
      // First register a user
      const registerInput = {
        username: `loginuser_${testId}`,
        email: `login_${testId}@example.com`,
        password: 'password123',
      };
      await resolvers.Mutation.register(null, { input: registerInput });

      // Now login
      const loginInput = {
        email: `login_${testId}@example.com`,
        password: 'password123',
      };

      const result = await resolvers.Mutation.login(null, { input: loginInput });

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(`login_${testId}@example.com`);
    });

    it('should reject invalid login credentials', async () => {
      const loginInput = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      await expect(resolvers.Mutation.login(null, { input: loginInput })).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});
