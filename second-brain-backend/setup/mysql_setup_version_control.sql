-- MySQL Setup Script for Version Control Database
-- Run this in MySQL Workbench

-- 1. Create database
CREATE DATABASE IF NOT EXISTS version_control_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Use the database
USE version_control_db;

-- 3. Test connection
SHOW TABLES; -- Should show empty initially

-- After running migrations, you can verify with:
-- SELECT COUNT(*) as table_count FROM information_schema.tables 
-- WHERE table_schema = 'version_control_db';
