import { container } from 'tsyringe';
import { UserService } from './service';
import type { Context, AuthPayload, RegisterInput, LoginInput } from './types';

const userService = container.resolve(UserService);

export const userResolvers = {
  Query: {
    me: (_: unknown, __: unknown, context: Context): Context['user'] => {
      return context.user;
    },
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: RegisterInput }): Promise<AuthPayload> => {
      return await userService.registerUser(input);
    },

    login: async (_: unknown, { input }: { input: LoginInput }): Promise<AuthPayload> => {
      return await userService.loginUser(input);
    },
  },
};
