# 🐳 REDIS DOCKER CONNECTION GUIDE
# ========================================

# 1. CHECK DOCKER STATUS
# ========================================

# Check if Docker Desktop is running
docker --version
docker ps

# If Docker is not running, start Docker Desktop first

# ========================================
# 2. REDIS DOCKER COMMANDS
# ========================================

# Option 1: Run Redis container (if not already running)
docker run -d --name redis-container -p 6379:6379 redis:latest

# Option 2: Run with persistent data
docker run -d --name redis-container -p 6379:6379 -v redis-data:/data redis:latest

# Option 3: Run with custom config
docker run -d --name redis-container -p 6379:6379 -v "$(pwd)/redis.conf:/usr/local/etc/redis/redis.conf" redis:latest redis-server /usr/local/etc/redis/redis.conf

# ========================================
# 3. CHECK RUNNING CONTAINERS
# ========================================

# List all running containers
docker ps

# List all containers (including stopped)
docker ps -a

# ========================================
# 4. CONNECT TO REDIS CONTAINER
# ========================================

# Test Redis connection
redis-cli ping

# Connect to Redis CLI
redis-cli

# Check Redis info
redis-cli info server

# ========================================
# 5. DOCKER COMPOSE OPTION (Recommended)
# ========================================

# Create docker-compose.yml file:
version: '3.8'
services:
  redis:
    image: redis:latest
    container_name: redis-second-brain
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  redis-data:

# Run with:
docker-compose up -d

# ========================================
# 6. TROUBLESHOOTING
# ========================================

# Check container logs
docker logs redis-container

# Stop container
docker stop redis-container

# Remove container
docker rm redis-container

# Force remove (if running)
docker rm -f redis-container

# ========================================
# 7. VERIFY CONNECTION TO PROJECT
# ========================================

# Test from project directory
cd "a:\New project\Version-Control\second-brain-backend"
redis-cli ping

# Should return: PONG

# Check if backend can connect
npm run dev
