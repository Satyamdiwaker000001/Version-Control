import mysql from 'mysql2/promise';
import { logger } from '@/utils/logger';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  acquireTimeout?: number;
  timeout?: number;
}

export interface QueryResult<T = any> {
  rows: T[];
  insertId?: number | null;
  affectedRows: number;
  changedRows: number;
}

export interface DatabaseInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T>;
}

export class DatabaseConnection implements DatabaseInterface {
  private pool: mysql.Pool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'second_brain',
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
      timeout: parseInt(process.env.DB_TIMEOUT || '60000'),
    };
  }

  public async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        connectionLimit: this.config.connectionLimit || 10,
        namedPlaceholders: true,
        multipleStatements: true,
      } as any);

      // Test connection
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();

      logger.info('✅ MySQL database connected successfully');
    } catch (error) {
      logger.error('❌ Failed to connect to MySQL database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        this.pool = null;
        logger.info('✅ MySQL database disconnected successfully');
      } catch (error) {
        logger.error('❌ Error disconnecting from MySQL database:', error);
        throw error;
      }
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    try {
      const [rows, fields] = await this.pool.execute(sql, params);
      
      const result = {
        rows: rows as T[],
        insertId: (rows as any).insertId || null,
        affectedRows: (rows as any).affectedRows || 0,
        changedRows: (rows as any).changedRows || 0,
      };

      logger.debug(`📊 Query executed: ${sql}`, { params: params.length > 0 ? params : undefined });
      return result;
    } catch (error) {
      logger.error(`❌ Query failed: ${sql}`, { params, error });
      throw error;
    }
  }

  public async transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const connection = await this.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      logger.debug('🔄 Transaction started');
      
      const result = await callback(connection);
      
      await connection.commit();
      logger.debug('✅ Transaction committed');
      
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error('❌ Transaction rolled back:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  public async healthCheck(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  public getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return this.pool;
  }
}
export const database = new DatabaseConnection();
