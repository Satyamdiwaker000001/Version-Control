-- ======================================================
-- COMPLETE & LATEST SCHEMA FOR VERSION_CONTROL_DB
-- ======================================================
-- This file defines the entire database structure, including:
-- 1. Initial Core Components (Users, Notes, Projects, Tags, etc.)
-- 2. Collaboration features (Workspaces, Chat Channels, Messages)
-- 3. Integration features (GitHub OAuth, Repositories, Commits)
-- 4. User Preferences & Tutorial features
-- ======================================================

CREATE DATABASE IF NOT EXISTS version_control_db;
USE version_control_db;

-- 1. USERS TABLE
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

-- 2. USER SESSIONS TABLE
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

-- 3. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    owner_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('solo', 'team') DEFAULT 'solo',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_workspace_slug (slug),
    INDEX idx_workspaces_owner (owner_id),
    INDEX idx_workspaces_slug (slug)
);

-- 4. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS workspace_members (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    workspace_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_workspace_user (workspace_id, user_id),
    INDEX idx_ws_members_workspace (workspace_id),
    INDEX idx_ws_members_user (user_id)
);

-- 5. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    workspace_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_public BOOLEAN DEFAULT FALSE,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL,
    INDEX idx_projects_user_id (user_id),
    INDEX idx_projects_name (name),
    INDEX idx_projects_created_at (created_at)
);

-- 6. GITHUB REPOSITORIES TABLE
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

-- 7. NOTES TABLE
CREATE TABLE IF NOT EXISTS notes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    workspace_id VARCHAR(36),
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
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL,
    INDEX idx_notes_user_id (user_id),
    INDEX idx_notes_project_id (project_id),
    INDEX idx_notes_title (title),
    INDEX idx_notes_created_at (created_at),
    INDEX idx_notes_updated_at (updated_at),
    INDEX idx_notes_is_favorite (is_favorite),
    INDEX idx_notes_is_archived (is_archived),
    FULLTEXT idx_notes_search (title, content)
);

-- 8. NOTE VERSIONS TABLE
CREATE TABLE IF NOT EXISTS note_versions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    note_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content LONGTEXT,
    commit_message VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_versions_note_id (note_id),
    INDEX idx_versions_user_id (user_id),
    INDEX idx_versions_created_at (created_at)
);

-- 9. TAGS TABLE
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

-- 9. NOTE TAGS JUNCTION TABLE
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

-- 10. GITHUB COMMITS TABLE
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

-- 11. NOTE COMMITS JUNCTION TABLE
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

-- 12. CHANNELS TABLE
CREATE TABLE IF NOT EXISTS channels (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    workspace_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('text', 'voice', 'announcement') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_channels_workspace (workspace_id),
    INDEX idx_channels_name (name)
);

-- 13. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    channel_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    content TEXT NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_messages_channel (channel_id),
    INDEX idx_messages_created_at (created_at)
);

-- 14. USER INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS user_integrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(100) NOT NULL,
    username VARCHAR(255),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    profile_url VARCHAR(500),
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_provider (user_id, provider),
    INDEX idx_integrations_user (user_id),
    INDEX idx_integrations_provider (provider)
);

-- 15. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    theme VARCHAR(20) DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    auto_save_interval INT DEFAULT 30,
    tutorial_completed BOOLEAN DEFAULT FALSE,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- 16. API KEYS TABLE
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

-- 17. MIGRATIONS TABLE
CREATE TABLE IF NOT EXISTS migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SAFE UPDATE PROCEDURE
-- =============================================
-- This procedure ensures that if you are updating an existing database,
-- the missing columns are added without errors.

DROP PROCEDURE IF EXISTS FinalSchemaUpdate;
DELIMITER //
CREATE PROCEDURE FinalSchemaUpdate()
BEGIN
    -- Add workspace_id to Projects
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'projects' AND COLUMN_NAME = 'workspace_id' AND TABLE_SCHEMA = 'version_control_db') THEN
        ALTER TABLE projects ADD COLUMN workspace_id VARCHAR(36);
        ALTER TABLE projects ADD CONSTRAINT fk_projects_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
    END IF;

    -- Add workspace_id to Notes
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'notes' AND COLUMN_NAME = 'workspace_id' AND TABLE_SCHEMA = 'version_control_db') THEN
        ALTER TABLE notes ADD COLUMN workspace_id VARCHAR(36);
        ALTER TABLE notes ADD CONSTRAINT fk_notes_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
    END IF;

    -- Add tutorial_completed to User Preferences
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_preferences' AND COLUMN_NAME = 'tutorial_completed' AND TABLE_SCHEMA = 'version_control_db') THEN
        ALTER TABLE user_preferences ADD COLUMN tutorial_completed BOOLEAN DEFAULT FALSE;
    END IF;
END //
DELIMITER ;

CALL FinalSchemaUpdate();
DROP PROCEDURE FinalSchemaUpdate;


-- ========================================
-- SAMPLE DATA
-- ========================================

-- Sample user (password: 'password123')
INSERT INTO users (email, name, password_hash) VALUES 
('demo@example.com', 'Demo User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvOe')
ON DUPLICATE KEY UPDATE id = id;

-- Sample workspace
INSERT INTO workspaces (owner_id, name, slug, type) VALUES
((SELECT id FROM users WHERE email = 'demo@example.com'), 'My Personal Workspace', 'my-personal-workspace', 'solo')
ON DUPLICATE KEY UPDATE id = id;

-- Link sample project to workspace
UPDATE projects SET workspace_id = (SELECT id FROM workspaces WHERE slug = 'my-personal-workspace')
WHERE user_id = (SELECT id FROM users WHERE email = 'demo@example.com');
