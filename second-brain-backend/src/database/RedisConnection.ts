import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
}

export interface CacheInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  keys(pattern: string): Promise<string[]>;
  flush(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

export class RedisConnection implements CacheInterface {
  private client: RedisClientType | null = null;
  private config: RedisConfig;

  constructor() {
    this.config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DATABASE || '0'),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100'),
    } as any;
  }

  public async connect(): Promise<void> {
    try {
      const redisConfig: any = {
        socket: {
          host: this.config.host,
          port: this.config.port,
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 attempts');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 50, 1000);
          },
        },
        database: this.config.database,
      };
      
      if (this.config.password) {
        redisConfig.password = this.config.password;
      }
      
      this.client = createClient(redisConfig);

      this.client.on('error', (error) => {
        logger.error('Redis client error:', error);
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis client connected');
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis client ready');
      });

      this.client.on('end', () => {
        logger.info('🔌 Redis client disconnected');
      });

      await this.client.connect();
      logger.info('✅ Redis connection established successfully');
    } catch (error) {
      logger.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.client = null;
        logger.info('✅ Redis connection closed successfully');
      } catch (error) {
        logger.error('❌ Error closing Redis connection:', error);
        throw error;
      }
    }
  }

  public async get(key: string): Promise<string | null> {
    if (!this.client) {
      throw new Error('Redis not connected');
    }

    try {
      const value = await this.client.get(key);
      logger.debug(`📖 Cache GET: ${key}`);
      return value;
    } catch (error) {
      logger.error(`❌ Cache GET failed for key ${key}:`, error);
      throw error;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) {
      throw new Error('Redis not connected');
    }

    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      logger.debug(`💾 Cache SET: ${key} ${ttl ? `(TTL: ${ttl}s)` : ''}`);
    } catch (error) {
      logger.error(`❌ Cache SET failed for key ${key}:`, error);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('Redis not connected');
    }

    try {
      await this.client.del(key);
      logger.debug(`🗑️ Cache DEL: ${key}`);
    } catch (error) {
      logger.error(`❌ Cache DEL failed for key ${key}:`, error);
      throw error;
    }
  }

  public async exists(key: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Redis not connected');
    }

    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`❌ Cache EXISTS failed for key ${key}:`, error);
      throw error;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('Redis not connected');
    }

    try {
      const keys = await this.client.keys(pattern);
      logger.debug(`🔍 Cache KEYS: ${pattern} (${keys.length} results)`);
      return keys;
    } catch (error) {
      logger.error(`❌ Cache KEYS failed for pattern ${pattern}:`, error);
      throw error;
    }
  }

  public async flush(): Promise<void> {
    if (!this.client) {
      throw new Error('Redis not connected');
    }

    try {
      await this.client.flushDb();
      logger.info('🧹 Cache database flushed');
    } catch (error) {
      logger.error('❌ Cache FLUSH failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error('Redis not connected');
    }
    return this.client;
  }
}

export const redis = new RedisConnection();
