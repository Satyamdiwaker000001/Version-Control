-- MySQL Setup Script for Second Brain
-- Run this in MySQL Workbench

-- 1. Create database
CREATE DATABASE IF NOT EXISTS second_brain 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 2. Create database user (optional, you can use root)
CREATE USER IF NOT EXISTS 'secondbrain'@'localhost' 
IDENTIFIED BY 'brainpass123';

-- 3. Grant permissions
GRANT ALL PRIVILEGES ON second_brain.* TO 'secondbrain'@'localhost';
FLUSH PRIVILEGES;

-- 4. Test connection
USE second_brain;
SHOW TABLES; -- Should show empty initially

-- After running migrations, you can verify with:
-- SELECT COUNT(*) as table_count FROM information_schema.tables 
-- WHERE table_schema = 'second_brain';
