-- Add GitHub integrations and tutorial status

-- User Integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(100),
    username VARCHAR(255),
    access_token TEXT NOT NULL,
    profile_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_provider (user_id, provider)
);

-- Note: tutorial_completed column addition is handled separately if needed, 
-- but since it exists, we can omit the complex procedure that breaks the driver.
-- If we really need it, we should run it as a single statement without DELIMITER.
