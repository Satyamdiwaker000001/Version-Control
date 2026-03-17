-- Second Brain Database Schema Update
-- Adding support for Workspaces, Chat, and Integrations

-- Workspaces table
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

-- Workspace members table
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

-- Channels table
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

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    channel_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36), -- NULL for system bot
    content TEXT NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_messages_channel (channel_id),
    INDEX idx_messages_created_at (created_at)
);

-- User Integrations table (moved from GitHub specifics to generic providers)
CREATE TABLE IF NOT EXISTS user_integrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'github', 'notion', etc.
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

-- Alter existing tables to add workspace support safely
DROP PROCEDURE IF EXISTS SafeAlterTables;
DELIMITER //
CREATE PROCEDURE SafeAlterTables()
BEGIN
    -- Add workspace_id to projects
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'projects' 
        AND COLUMN_NAME = 'workspace_id' 
        AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE projects ADD COLUMN workspace_id VARCHAR(36);
    END IF;

    -- Add workspace_id to notes
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'notes' 
        AND COLUMN_NAME = 'workspace_id' 
        AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE notes ADD COLUMN workspace_id VARCHAR(36);
    END IF;

    -- Add tutorial_completed to user_preferences
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'user_preferences' 
        AND COLUMN_NAME = 'tutorial_completed' 
        AND TABLE_SCHEMA = DATABASE()
    ) THEN
        ALTER TABLE user_preferences ADD COLUMN tutorial_completed BOOLEAN DEFAULT FALSE;
    END IF;
END //
DELIMITER ;
CALL SafeAlterTables();
DROP PROCEDURE SafeAlterTables;
