import { taskResolvers } from '../domains/task';
import { userResolvers } from '../domains/user';

interface ResolverObject {
  Query?: Record<string, any>;
  Mutation?: Record<string, any>;
}

function mergeResolvers(...resolvers: ResolverObject[]): Required<ResolverObject> {
  const merged: Required<ResolverObject> = {
    Query: {},
    Mutation: {},
  };

  for (const resolver of resolvers) {
    if (resolver.Query) {
      Object.assign(merged.Query, resolver.Query);
    }
    if (resolver.Mutation) {
      Object.assign(merged.Mutation, resolver.Mutation);
    }
  }

  return merged;
}

export const resolvers = mergeResolvers(taskResolvers, userResolvers);
