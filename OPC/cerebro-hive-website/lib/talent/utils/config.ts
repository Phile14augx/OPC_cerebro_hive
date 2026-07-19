/**
 * Environment Configuration Validator
 * Fails fast at application startup if critical environment variables are missing.
 */
import { Logger } from '../infrastructure/observability/logger';

const logger = new Logger('ConfigValidator');

export interface AppConfig {
  databaseUrl: string;
  redisUrl: string;
  nodeEnv: string;
  aiProviderKey: string;
}

function validateEnv(): AppConfig {
  const config = {
    databaseUrl: process.env.DATABASE_URL || '',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    nodeEnv: process.env.NODE_ENV || 'development',
    aiProviderKey: process.env.AI_PROVIDER_KEY || 'MOCK_KEY',
  };

  const missing: string[] = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');
  // Add other critical checks as needed

  if (missing.length > 0) {
    const errorMsg = `CRITICAL CONFIGURATION ERROR: Missing required environment variables: ${missing.join(', ')}`;
    logger.error(errorMsg);
    
    // In production, we might want to process.exit(1) here if it's truly unrecoverable
    if (config.nodeEnv === 'production') {
      throw new Error(errorMsg);
    }
  }

  return config;
}

export const appConfig = validateEnv();
