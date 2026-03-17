import { DatabaseConnection } from './src/database/DatabaseConnection';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const db = new DatabaseConnection();
  await db.connect();
  try {
    const result = await db.query('SHOW TABLES');
    console.log('Tables:', result.rows);
    const migs = await db.query('SELECT * FROM migrations').catch(() => ({ rows: [] }));
    console.log('Executed Migrations:', migs.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await db.disconnect();
  }
}

check();
