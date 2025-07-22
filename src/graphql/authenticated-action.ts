import type { Context, User } from '../domains/user';
import { GraphQLError } from 'graphql/index';

export default function AuthenticatedAction<A, B, T>(
  fn: (a: A, b: B, context: Context, user: Omit<User, 'password'>) => T
): (a: A, b: B, context: Context) => T {
  return (a: A, b: B, context: Context) => {
    if (!context.user) {
      throw new GraphQLError('Authentication required', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }
    return fn(a, b, context, context.user);
  };
}
