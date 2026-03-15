-- ========================================
-- COMPLETE DATABASE SETUP FOR VERSION CONTROL PROJECT
-- ========================================

-- 1. CREATE DATABASE
CREATE DATABASE IF NOT EXISTS version_control_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE version_control_db;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    avatar_url VARCHAR(500),
    github_id VARCHAR(100) UNIQUE,
    github_username VARCHAR(255),
    github_access_token TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_github_id (github_id),
    INDEX idx_users_created_at (created_at)
);

-- 3. USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_token_hash (token_hash),
    INDEX idx_sessions_expires_at (expires_at)
);

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_public BOOLEAN DEFAULT FALSE,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projects_user_id (user_id),
    INDEX idx_projects_name (name),
    INDEX idx_projects_created_at (created_at)
);

-- 5. GITHUB REPOSITORIES TABLE
CREATE TABLE IF NOT EXISTS github_repositories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    github_repo_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(100),
    stargazers_count INT DEFAULT 0,
    forks_count INT DEFAULT 0,
    open_issues_count INT DEFAULT 0,
    clone_url VARCHAR(500),
    html_url VARCHAR(500),
    is_private BOOLEAN DEFAULT FALSE,
    is_synced BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMP NULL,
    sync_status ENUM('pending', 'syncing', 'completed', 'failed') DEFAULT 'pending',
    sync_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_github_repo (user_id, github_repo_id),
    INDEX idx_repos_user_id (user_id),
    INDEX idx_repos_github_repo_id (github_repo_id),
    INDEX idx_repos_language (language),
    INDEX idx_repos_synced (is_synced)
);

-- 6. NOTES TABLE
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    project_id VARCHAR(36),
    title VARCHAR(500) NOT NULL,
    content LONGTEXT,
    content_type ENUM('markdown', 'rich_text', 'code') DEFAULT 'markdown',
    metadata JSON,
    is_public BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    word_count INT DEFAULT 0,
    reading_time_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_notes_user_id (user_id),
    INDEX idx_notes_project_id (project_id),
    INDEX idx_notes_title (title),
    INDEX idx_notes_created_at (created_at),
    INDEX idx_notes_updated_at (updated_at),
    INDEX idx_notes_is_favorite (is_favorite),
    INDEX idx_notes_is_archived (is_archived),
    FULLTEXT idx_notes_search (title, content)
);

-- 7. TAGS TABLE
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag_name (user_id, name),
    INDEX idx_tags_user_id (user_id),
    INDEX idx_tags_name (name)
);

-- 8. NOTE TAGS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS note_tags (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    note_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE KEY unique_note_tag (note_id, tag_id),
    INDEX idx_note_tags_note_id (note_id),
    INDEX idx_note_tags_tag_id (tag_id)
);

-- 9. GITHUB COMMITS TABLE
CREATE TABLE IF NOT EXISTS github_commits (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    repository_id VARCHAR(36) NOT NULL,
    commit_sha VARCHAR(40) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255),
    author_date TIMESTAMP NOT NULL,
    commit_date TIMESTAMP NOT NULL,
    url VARCHAR(500),
    additions INT DEFAULT 0,
    deletions INT DEFAULT 0,
    changed_files INT DEFAULT 0,
    file_changes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (repository_id) REFERENCES github_repositories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_commit_repo (repository_id, commit_sha),
    INDEX idx_commits_repository_id (repository_id),
    INDEX idx_commits_author_date (author_date),
    INDEX idx_commits_commit_date (commit_date),
    FULLTEXT idx_commits_search (message, author_name)
);

-- 10. NOTE COMMITS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS note_commits (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    note_id VARCHAR(36) NOT NULL,
    commit_id VARCHAR(36) NOT NULL,
    relationship_type ENUM('related', 'explains', 'documents') DEFAULT 'related',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (commit_id) REFERENCES github_commits(id) ON DELETE CASCADE,
    UNIQUE KEY unique_note_commit (note_id, commit_id),
    INDEX idx_note_commits_note_id (note_id),
    INDEX idx_note_commits_commit_id (commit_id)
);

-- 11. ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS analytics_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_events_user_id (user_id),
    INDEX idx_events_type (event_type),
    INDEX idx_events_created_at (created_at)
);

-- 12. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    auto_save_interval INT DEFAULT 30,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- 13. API KEYS TABLE
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    permissions JSON,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_api_keys_user_id (user_id),
    INDEX idx_api_keys_key_hash (key_hash),
    INDEX idx_api_keys_expires_at (expires_at)
);

-- 14. MIGRATIONS TABLE (for tracking migrations)
CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================

-- Sample user (password: 'password123')
INSERT INTO users (email, name, password_hash) VALUES 
('demo@example.com', 'Demo User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe')
ON DUPLICATE KEY UPDATE email = email;

-- Sample project
INSERT INTO projects (user_id, name, description) VALUES 
((SELECT id FROM users WHERE email = 'demo@example.com'), 'My First Project', 'A demo project for testing')
ON DUPLICATE KEY UPDATE name = name;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check all tables were created
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.tables 
WHERE table_schema = 'version_control_db'
ORDER BY TABLE_NAME;

-- Check sample data
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as project_count FROM projects;
