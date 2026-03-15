# ========================================
# REDIS SETUP AND COMMANDS FOR VERSION CONTROL PROJECT
# ========================================

# 1. REDIS CONNECTION TESTS
# ========================================

# Test Redis connection
redis-cli ping

# Check Redis info
redis-cli info server

# Check database size
redis-cli dbsize

# Check all keys (use with caution in production)
redis-cli keys "*"

# ========================================
# 2. REDIS DATA STRUCTURES USED IN PROJECT
# ========================================

# User Sessions (Key: session:{userId})
# Structure: Hash
# Example: session:user-123
# Fields: accessToken, refreshToken, createdAt
redis-cli HGETALL "session:user-123"

# Cache for API responses (Key: cache:{endpoint}:{params})
# Structure: String with TTL
# Example: cache:github:repos:user-123
redis-cli GET "cache:github:repos:user-123"
redis-cli TTL "cache:github:repos:user-123"

# Rate limiting (Key: ratelimit:{userId}:{endpoint})
# Structure: String with expiration
# Example: ratelimit:user-123:api:login
redis-cli GET "ratelimit:user-123:api:login"
redis-cli INCR "ratelimit:user-123:api:login"

# User preferences cache (Key: prefs:{userId})
# Structure: Hash
# Example: prefs:user-123
redis-cli HGETALL "prefs:user-123"

# GitHub API tokens (Key: github:token:{userId})
# Structure: String with TTL
# Example: github:token:user-123
redis-cli GET "github:token:user-123"

# ========================================
# 3. REDIS SETUP SCRIPTS
# ========================================

# Clear all data (development only)
redis-cli FLUSHALL

# Clear only cache data
redis-cli EVAL "return redis.call('del', unpack(redis.call('keys', 'cache:*')))" 0

# Set up sample session data
redis-cli HMSET "session:user-123" \
  "accessToken" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  "refreshToken" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  "createdAt" "2026-03-15T11:46:00.000Z"

# Set session expiration (30 days)
redis-cli EXPIRE "session:user-123" 2592000

# Set up cache data with 1 hour TTL
redis-cli SET "cache:github:repos:user-123" '[{"id":123,"name":"demo-repo"}]' EX 3600

# Set up rate limiting
redis-cli SET "ratelimit:user-123:api:login" 1 EX 900
redis-cli INCR "ratelimit:user-123:api:login"

# ========================================
# 4. REDIS MONITORING COMMANDS
# ========================================

# Monitor Redis commands in real-time
redis-cli MONITOR

# Check memory usage
redis-cli info memory

# Check connected clients
redis-cli info clients

# Check slow log
redis-cli SLOWLOG GET 10

# ========================================
# 5. REDIS CONFIGURATION FOR PROJECT
# ========================================

# Recommended redis.conf settings for development:
# maxmemory 256mb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000

# ========================================
# 6. USEFUL REDIS QUERIES FOR DEBUGGING
# ========================================

# Get all active sessions
redis-cli EVAL "return redis.call('keys', 'session:*')" 0

# Get session for specific user
redis-cli HGETALL "session:user-123"

# Check cache keys
redis-cli EVAL "return redis.call('keys', 'cache:*')" 0

# Check rate limits
redis-cli EVAL "return redis.call('keys', 'ratelimit:*')" 0

# Get Redis memory usage by key pattern
redis-cli --scan --pattern "session:*" | xargs redis-cli MEMORY USAGE

# ========================================
# 7. REDIS CLEANUP COMMANDS
# ========================================

# Clean expired sessions
redis-cli EVAL "
local keys = redis.call('keys', 'session:*')
local cleaned = 0
for i=1,#keys do
    if redis.call('TTL', keys[i]) == -1 then
        redis.call('DEL', keys[i])
        cleaned = cleaned + 1
    end
end
return cleaned
" 0

# Clean old cache entries
redis-cli EVAL "
local keys = redis.call('keys', 'cache:*')
local cleaned = 0
for i=1,#keys do
    if redis.call('TTL', keys[i]) == -1 then
        redis.call('DEL', keys[i])
        cleaned = cleaned + 1
    end
end
return cleaned
" 0
