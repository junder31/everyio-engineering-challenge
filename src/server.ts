import 'dotenv/config';
import 'reflect-metadata';
import { container } from 'tsyringe';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import type { Context } from './domains/user/types';
import { verifyToken, extractTokenFromHeader } from './utils/auth';
import { connectDatabase } from './config/database';
import logger from './utils/logger';
import { isProductionEnvironment } from './utils/environment';
import { UserService } from './domains/user';

async function startServer() {
  const app = express();
  const port = process.env.PORT || 4000;
  logger.info(`ENV: ${process.env.NODE_ENV}`);

  // Connect to database
  await connectDatabase();

  // Create Apollo Server
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    formatError: (err) => {
      logger.error('GraphQL Error:', err);
      return err;
    },
    introspection: !isProductionEnvironment(),
  });

  await server.start();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        const token = extractTokenFromHeader(req.headers.authorization);
        if (token) {
          try {
            const { userId } = verifyToken(token);
            const userService = container.resolve(UserService);
            const user = await userService.getUserById(userId);
            if (user) {
              return {
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  createdAt: user.createdAt,
                },
              };
            }
          } catch (error) {
            logger.warn('Invalid token provided');
          }
        }
        return {};
      },
    })
  );

  // Start the server
  app.listen(port, () => {
    logger.info(`🚀 Server ready at http://localhost:${port}/graphql`);
    logger.info(`📋 Health check available at http://localhost:${port}/health`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
