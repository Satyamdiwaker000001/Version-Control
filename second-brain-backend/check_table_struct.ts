import { DatabaseConnection } from './src/database/DatabaseConnection';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  const db = new DatabaseConnection();
  await db.connect();
  try {
    const result = await db.query('DESCRIBE user_integrations');
    console.log('user_integrations structure:', result.rows);
    const prefResult = await db.query('DESCRIBE user_preferences');
    console.log('user_preferences structure:', prefResult.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await db.disconnect();
  }
}

check();
