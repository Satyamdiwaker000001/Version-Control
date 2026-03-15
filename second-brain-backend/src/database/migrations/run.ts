import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { DatabaseConnection } from '../DatabaseConnection';
import { logger } from '@/utils/logger';

// Load environment variables
dotenv.config();

export class MigrationRunner {
  private database: DatabaseConnection;
  private migrationsPath: string;

  constructor(database: DatabaseConnection) {
    this.database = database;
    this.migrationsPath = __dirname;
  }

  public async runMigrations(): Promise<void> {
    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get all migration files
      const migrationFiles = this.getMigrationFiles();
      
      // Get already executed migrations
      const executedMigrations = await this.getExecutedMigrations();

      // Run pending migrations
      for (const file of migrationFiles) {
        const migrationName = path.basename(file, '.sql');
        
        if (!executedMigrations.includes(migrationName)) {
          logger.info(`🔄 Running migration: ${migrationName}`);
          await this.runMigration(file, migrationName);
        } else {
          logger.debug(`⏭️ Migration already executed: ${migrationName}`);
        }
      }

      logger.info('✅ All migrations completed successfully');
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      throw error;
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const sql = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await this.database.query(sql);
  }

  private getMigrationFiles(): string[] {
    const files = fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    return files.map(file => path.join(this.migrationsPath, file));
  }

  private async getExecutedMigrations(): Promise<string[]> {
    const result = await this.database.query('SELECT name FROM migrations ORDER BY name');
    return result.rows.map((row: any) => row.name);
  }

  private async runMigration(filePath: string, migrationName: string): Promise<void> {
    const migrationSQL = fs.readFileSync(filePath, 'utf8');
    
    await this.database.transaction(async (connection) => {
      // Execute migration SQL
      await connection.query(migrationSQL);
      
      // Record migration as executed
      await connection.execute(
        'INSERT INTO migrations (name) VALUES (?)',
        [migrationName]
      );
    });

    logger.info(`✅ Migration completed: ${migrationName}`);
  }

  public async rollbackMigration(migrationName: string): Promise<void> {
    try {
      await this.database.transaction(async (connection) => {
        // Remove migration record
        await connection.execute(
          'DELETE FROM migrations WHERE name = ?',
          [migrationName]
        );
      });

      logger.info(`⏪ Migration rolled back: ${migrationName}`);
    } catch (error) {
      logger.error(`❌ Failed to rollback migration ${migrationName}:`, error);
      throw error;
    }
  }
}

// CLI runner for migrations
export async function runMigrations(): Promise<void> {
  const database = new DatabaseConnection();
  await database.connect();
  
  try {
    const migrationRunner = new MigrationRunner(database);
    await migrationRunner.runMigrations();
  } finally {
    await database.disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  runMigrations().catch((error) => {
    logger.error('Migration runner failed:', error);
    process.exit(1);
  });
}
