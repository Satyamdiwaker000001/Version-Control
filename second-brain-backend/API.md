# Second Brain - Backend API Documentation

## Architecture Overview

### Service Layer Pattern

All business logic is encapsulated in services that handle:

- Database operations
- Business logic
- Error handling
- Authorization checks

**Services:**

- `authService` - User authentication and profile management
- `workspaceService` - Workspace and member management
- `noteService` - Notes, content, versions
- `tagService` - Tags/labels system
- `chatService` - Channels and messaging
- `githubService` - GitHub integration

### Database Schema

**Key Tables:**

- `User` - Authentication and profile
- `Workspace` - Team/solo workspaces
- `WorkspaceMember` - Workspace membership with roles
- `Note` - Engineering documentation
- `NoteVersion` - Version history tracking
- `Tag` - Labels for organizing notes
- `Channel` - Chat channels
- `Message` - Channel and note messages
- `Repository` - Linked GitHub repositories

## API Endpoints

### Authentication (`/api/auth`)

```
POST   /register              - Register new user
POST   /login                 - Login user
GET    /me                    - Get current user (protected)
PATCH  /me                    - Update profile (protected)
```

**Auth Response:**

```json
{
  "success": true,
  "data": {
    "token": "jwt.token.here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Workspaces (`/api/workspaces`)

```
POST   /                      - Create workspace
GET    /                      - List user workspaces
GET    /:workspaceId          - Get workspace
PATCH  /:workspaceId          - Update workspace

GET    /:workspaceId/members  - List members
POST   /:workspaceId/members  - Add member
DELETE /:workspaceId/members/:memberId - Remove member
```

### Notes (`/api/notes`)

```
POST   /:workspaceId          - Create note
GET    /:workspaceId          - List notes (paginated)
GET    /:noteId               - Get note details
PATCH  /:noteId               - Update note
DELETE /:noteId               - Delete note

GET    /:noteId/versions      - List versions
POST   /:noteId/versions/:versionId/restore - Restore version
```

**Create Note:**

```json
{
  "title": "System Design",
  "content": "# Markdown content",
  "description": "Brief summary",
  "tagIds": ["tag-id-1", "tag-id-2"]
}
```

### Tags (`/api/taxonomy`)

```
POST   /:workspaceId/tags     - Create tag
GET    /:workspaceId/tags     - List tags
GET    /:tagId                - Get tag
PATCH  /:tagId                - Update tag
DELETE /:tagId                - Delete tag
```

**Create Tag:**

```json
{
  "name": "Backend",
  "color": "#6366F1",
  "emoji": "⚙️",
  "description": "Backend development"
}
```

### Chat (`/api/chat`)

```
POST   /:workspaceId/channels - Create channel
GET    /:workspaceId/channels - List channels
DELETE /:channelId            - Delete channel

POST   /:workspaceId/channels/:channelId/messages - Send message
GET    /:channelId/messages   - Get messages
PATCH  /:messageId            - Edit message
DELETE /:messageId            - Delete message

GET    /:messageId/replies    - Get message threads
POST   /:messageId/reactions  - Add reaction
DELETE /:messageId/reactions  - Remove reaction
```

**Send Message:**

```json
{
  "content": "Hello team!",
  "parentMessageId": null
}
```

### GitHub (`/api/github`)

```
GET    /authorize             - Get OAuth URL
POST   /exchange              - Exchange OAuth code for token

POST   /:workspaceId/repositories - Link repository
GET    /:workspaceId/repositories - List repositories
GET    /:repositoryId         - Get repository
DELETE /:repositoryId         - Unlink repository

GET    /:owner/:repo/commits  - Get commits
GET    /:owner/:repo/branches - Get branches
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": []
}
```

**Common Error Codes:**

- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `INTERNAL_ERROR` - Server error

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <jwt.token>
```

Tokens expire in 7 days.

## Response Format

All successful responses:

```json
{
  "success": true,
  "data": {}
}
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Setup environment:

```bash
cp .env.example .env
# Edit .env with your values
```

3. Setup database:

```bash
npx prisma migrate dev --name init
```

4. Start development server:

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## Development

- TypeScript for type safety
- Zod for validation
- Prisma for database
- JWT for authentication
- Express middlewares for auth/errors

## Key Features Implemented

✅ User authentication (register/login/JWT)
✅ Workspace management with member roles
✅ Note CRUD with markdown support
✅ Note versioning and history
✅ Tag system with colors/emojis
✅ Real-time chat channels
✅ Message threading
✅ Emoji reactions
✅ GitHub repository linking
✅ Comprehensive error handling
✅ Authorization checks

## Next Steps (Frontend)

- [x] Backend complete
- [ ] Frontend React components
- [ ] API client setup
- [ ] Authentication flows
- [ ] Dashboard
- [ ] Note editor
- [ ] Chat interface
- [ ] WebSocket integration for real-time chat
