export const taskTypeDefs = `#graphql
  enum TaskStatus {
    TODO
    IN_PROGRESS
    DONE
    ARCHIVED
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    status: TaskStatus!
    userId: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateTaskInput {
    title: String!
    description: String!
    status: TaskStatus = TODO
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
  }

  input UpdateTaskStatusInput {
    id: ID!
    status: TaskStatus!
  }

  extend type Query {
    tasks: [Task!]!
    task(id: ID!): Task
  }

  extend type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    updateTaskStatus(input: UpdateTaskStatusInput!): Task!
    archiveTask(id: ID!): Task!
  }
`;
