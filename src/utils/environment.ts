/**
 * Utility functions for environment checking
 */

import logger from './logger';

/**
 * Ensures the current environment is test mode
 * @throws {Error} If not in test environment
 */
export function ensureTestEnvironment(): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('This operation can only be performed in test environment');
  }
}

/**
 * Checks if the current environment is test mode
 * @returns {boolean} True if in test environment
 */
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Checks if the current environment is development mode
 * @returns {boolean} True if in development environment
 */
export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if the current environment is production mode
 * @returns {boolean} True if in production environment
 */
export function isProductionEnvironment(): boolean {
  logger.info(`ENV: ${process.env.NODE_ENV}`);
  return process.env.NODE_ENV === 'production';
}

/**
 * Gets the current environment
 * @returns {string} The current NODE_ENV value or 'development' as default
 */
export function getCurrentEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}
