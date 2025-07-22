import { taskTypeDefs } from '../domains/task';
import { userTypeDefs } from '../domains/user';

export const typeDefs = [
  // Base schema with Query and Mutation types
  `#graphql
    type Query
    type Mutation
  `,
  taskTypeDefs,
  userTypeDefs,
];
