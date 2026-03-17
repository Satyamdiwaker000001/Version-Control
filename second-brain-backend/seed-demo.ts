import dotenv from 'dotenv';
dotenv.config();
import { DatabaseConnection } from './src/database/DatabaseConnection';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedDemoUser() {
  const db = new DatabaseConnection();
  await db.connect();
  
  try {
    const email = 'demo@example.com';
    const password = 'demo1234';
    const name = 'Demo User';
    
    // Check if exists
    const [existing]: any = await db.getPool().query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      console.log('Demo user already exists');
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    
    await db.query(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      [userId, email, name, hashedPassword]
    );
    
    console.log(`✅ Demo user created with ID: ${userId}`);
  } catch (error) {
    console.error('Failed to seed demo user:', error);
  } finally {
    await db.disconnect();
  }
}

seedDemoUser();
