import { Sequelize } from 'sequelize';
import logger from '../utils/logger';
import { isProductionEnvironment, isTestEnvironment } from '../utils/environment';

const isProduction = isProductionEnvironment();
const isTest = isTestEnvironment();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || (isTest ? 'task_api_test' : 'task_api'),
  username: process.env.DB_USER || 'task_api_user',
  password: process.env.DB_PASSWORD || 'task_api_password',
  dialect: 'postgres' as const,
  logging: isProduction ? false : (msg: string) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Create Sequelize instance
export const sequelize = new Sequelize({
  ...config,
  define: {
    underscored: true,
    timestamps: true,
  },
});

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync models in development/test
    if (!isProduction) {
      await sequelize.sync({ alter: isTest });
      logger.info('Database synced successfully');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};
