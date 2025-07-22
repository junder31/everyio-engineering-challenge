import { connectDatabase, closeDatabase } from '../config/database';
import { TaskStatus, TaskStore } from '../domains/task';
import { UserStore } from '../domains/user';
import { container } from 'tsyringe';

describe('DatabaseStore', () => {
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
    await taskStore.clear();
    await userStore.clear();
  });

  describe('User operations', () => {
    it('should create user successfully', async () => {
      const user = await userStore.createUser('testuser', 'test@example.com', 'hashedpassword');

      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('hashedpassword');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should find user by email', async () => {
      const user = await userStore.createUser('testuser', 'test@example.com', 'hashedpassword');
      const foundUser = await userStore.findUserByEmail('test@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
    });

    it('should find user by id', async () => {
      const user = await userStore.createUser('testuser', 'test@example.com', 'hashedpassword');
      const foundUser = await userStore.findUserById(user.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      const foundUser = await userStore.findUserByEmail('nonexistent@example.com');
      expect(foundUser).toBeNull();
    });

    it('should prevent duplicate email registration', async () => {
      await userStore.createUser('user1', 'duplicate@example.com', 'password1');

      await expect(
        userStore.createUser('user2', 'duplicate@example.com', 'password2')
      ).rejects.toThrow();
    });
  });

  describe('Task operations', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await userStore.createUser('testuser', 'test@example.com', 'password');
      userId = user.id;
    });

    it('should create task successfully', async () => {
      const task = await taskStore.createTask('Test Task', 'Description', userId);

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Description');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.userId).toBe(userId);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should create task with custom status', async () => {
      const task = await taskStore.createTask(
        'Test Task',
        'Description',
        userId,
        TaskStatus.IN_PROGRESS
      );

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should find task by id', async () => {
      const task = await taskStore.createTask('Test Task', 'Description', userId);
      const foundTask = await taskStore.findTaskById(task.id);

      expect(foundTask).toBeDefined();
      expect(foundTask?.title).toBe('Test Task');
    });

    it('should find tasks by user id', async () => {
      const task1 = await taskStore.createTask('Task 1', 'Description 1', userId);
      const task2 = await taskStore.createTask('Task 2', 'Description 2', userId);

      // Create task for different user
      const otherUser = await userStore.createUser('otheruser', 'other@example.com', 'password');
      await taskStore.createTask('Other Task', 'Other Description', otherUser.id);

      const userTasks = await taskStore.findTasksByUserId(userId);

      expect(userTasks).toHaveLength(2);
      expect(userTasks.map((t: any) => t.id).sort()).toEqual([task1.id, task2.id].sort());
    });

    it('should filter tasks by status', async () => {
      await taskStore.createTask('TODO Task', 'Description', userId, TaskStatus.TODO);
      await taskStore.createTask('In Progress Task', 'Description', userId, TaskStatus.IN_PROGRESS);

      const todoTasks = await taskStore.findTasksByUserId(userId, TaskStatus.TODO);
      const inProgressTasks = await taskStore.findTasksByUserId(userId, TaskStatus.IN_PROGRESS);

      expect(todoTasks).toHaveLength(1);
      expect(todoTasks[0].status).toBe(TaskStatus.TODO);

      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0].status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should update task successfully', async () => {
      const task = await taskStore.createTask('Original Title', 'Original Description', userId);
      const originalUpdatedAt = task.updatedAt;

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const updatedTask = await taskStore.updateTask(task.id, {
        title: 'Updated Title',
        status: TaskStatus.DONE,
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.description).toBe('Original Description'); // Unchanged
      expect(updatedTask?.status).toBe(TaskStatus.DONE);
      expect(updatedTask?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should return null when updating non-existent task', async () => {
      const result = await taskStore.updateTask('550e8400-e29b-41d4-a716-446655440000', {
        title: 'New Title',
      });
      expect(result).toBeNull();
    });

    it('should get task counts by status', async () => {
      await taskStore.createTask('TODO Task 1', 'Description', userId, TaskStatus.TODO);
      await taskStore.createTask('TODO Task 2', 'Description', userId, TaskStatus.TODO);
      await taskStore.createTask('In Progress Task', 'Description', userId, TaskStatus.IN_PROGRESS);
      await taskStore.createTask('Done Task', 'Description', userId, TaskStatus.DONE);

      const counts = await taskStore.getTaskCountsByStatus(userId);

      expect(counts[TaskStatus.TODO]).toBe(2);
      expect(counts[TaskStatus.IN_PROGRESS]).toBe(1);
      expect(counts[TaskStatus.DONE]).toBe(1);
      expect(counts[TaskStatus.ARCHIVED]).toBe(0);
    });

    it('should search tasks by title and description', async () => {
      await taskStore.createTask('Important Meeting', 'Discuss project timeline', userId);
      await taskStore.createTask('Code Review', 'Review the new feature', userId);
      await taskStore.createTask('Shopping', 'Buy groceries', userId);

      const searchResults = await taskStore.searchTasks(userId, 'project');

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('Important Meeting');
    });
  });

  describe('Clear functionality', () => {
    it('should clear all data', async () => {
      const user = await userStore.createUser('testuser', 'test@example.com', 'password');
      await taskStore.createTask('Test Task', 'Description', user.id);

      await taskStore.clear();
      await userStore.clear();

      const foundUser = await userStore.findUserById(user.id);
      const userTasks = await taskStore.findTasksByUserId(user.id);

      expect(foundUser).toBeNull();
      expect(userTasks).toHaveLength(0);
    });
  });
});
