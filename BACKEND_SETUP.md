# Second Brain Backend Implementation Guide

## Overview

The backend is built with Node.js, Express, Prisma ORM, and SQLite. It provides RESTful API endpoints for the frontend with proper authentication, workspace isolation, and modular service architecture.

## Project Structure

```
second-brain-backend/
├── src/
│   ├── index.ts                      # Entry point
│   ├── app.ts                        # Express app config
│   ├── controllers/                  # Route handlers
│   │   ├── authController.ts         # Auth logic
│   │   ├── workspaceController.ts    # Workspace CRUD
│   │   ├── noteController.ts         # Notes CRUD
│   │   ├── tagController.ts          # Tags CRUD
│   │   ├── chatController.ts         # Chat messages
│   │   └── githubController.ts       # GitHub integration
│   ├── services/                     # Business logic (NEW)
│   │   ├── noteService.ts            # Note operations
│   │   ├── tagService.ts             # Tag operations
│   │   ├── workspaceService.ts       # Workspace operations
│   │   └── chatService.ts            # Chat operations
│   ├── middlewares/
│   │   └── authMiddleware.ts         # JWT verification
│   ├── routes/                       # API routes
│   │   ├── authRoutes.ts
│   │   ├── workspaceRoutes.ts
│   │   ├── noteRoutes.ts
│   │   ├── tagRoutes.ts
│   │   └── githubRoutes.ts
│   └── types/                        # TypeScript types (optional)
├── prisma/
│   └── schema.prisma                 # Database schema
├── package.json
└── tsconfig.json
```

## Database Schema

### Models

- **User**: User accounts with authentication
- **Workspace**: Collaboration spaces (personal or team)
- **WorkspaceMember**: Links users to workspaces with roles
- **Note**: Documents with versioning
- **NoteVersion**: Version history for notes
- **Tag**: Colored labels for organizing notes
- **Message**: Chat messages in workspace
- **Repository**: Connected GitHub repositories

### Key Relationships

- Workspaces belong to a User (owner)
- Notes belong to Workspaces and Users
- Tags are workspace-scoped
- Messages are isolated per workspace
- WorkspaceMembers control multi-user access

## API Endpoints

### Authentication

```
POST   /api/auth/register           # Create account
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user (protected)
POST   /api/auth/logout            # Logout
POST   /api/auth/change-password   # Change password (protected)
```

### Workspaces

```
GET    /api/workspaces             # List user's workspaces (protected)
POST   /api/workspaces             # Create workspace (protected)
GET    /api/workspaces/:id         # Get workspace details (protected)
PUT    /api/workspaces/:id         # Update workspace (protected)
DELETE /api/workspaces/:id         # Delete workspace (protected)

GET    /api/workspaces/:id/members         # List members (protected)
POST   /api/workspaces/:id/members         # Add member (protected)
PUT    /api/workspaces/:id/members/:userId # Update role (protected)
DELETE /api/workspaces/:id/members/:userId # Remove member (protected)
```

### Notes

```
GET    /api/workspaces/:id/notes            # List notes (protected)
POST   /api/workspaces/:id/notes            # Create note (protected)
GET    /api/workspaces/:id/notes/:noteId    # Get note (protected)
PUT    /api/workspaces/:id/notes/:noteId    # Update note (protected)
DELETE /api/workspaces/:id/notes/:noteId    # Delete note (protected)

GET    /api/workspaces/:id/notes/:noteId/versions             # Get versions
POST   /api/workspaces/:id/notes/:noteId/versions/:versionId/restore # Restore
```

### Tags

```
GET    /api/workspaces/:id/tags           # List tags (protected)
POST   /api/workspaces/:id/tags           # Create tag (protected)
PUT    /api/workspaces/:id/tags/:tagId    # Update tag (protected)
DELETE /api/workspaces/:id/tags/:tagId    # Delete tag (protected)
```

### Chat

```
GET    /api/workspaces/:id/messages       # Get messages (protected)
POST   /api/workspaces/:id/messages       # Send message (protected)
PUT    /api/workspaces/:id/messages/:id   # Edit message (protected)
DELETE /api/workspaces/:id/messages/:id   # Delete message (protected)
```

### GitHub Integration

```
POST   /api/github/repositories                # Connect repo
GET    /api/workspaces/:id/github/repositories # List connected repos
GET    /api/workspaces/:id/github/repositories/:repoId # Get repo details
DELETE /api/workspaces/:id/github/repositories/:repoId # Disconnect repo

GET    /api/workspaces/:id/github/repositories/:repoId/commits  # Get commits
GET    /api/workspaces/:id/github/repositories/:repoId/branches # Get branches
GET    /api/workspaces/:id/github/repositories/:repoId/issues   # Get issues
```

## Service Layer Architecture

### Benefits of Services

1. **Separation of Concerns**: Business logic separated from HTTP handling
2. **Reusability**: Services can be called from multiple controllers or scheduled jobs
3. **Testability**: Pure functions easier to unit test
4. **Maintainability**: Changes to logic don't affect route handlers

### Using Services in Controllers

```typescript
import { noteService } from "../services/noteService";
import { workspaceService } from "../services/workspaceService";

export const noteController = {
  createNote: async (req: any, res: Response) => {
    try {
      // Verify workspace access first
      const hasAccess = await workspaceService.verifyWorkspaceAccess(
        req.params.workspaceId,
        req.user.id,
      );
      if (!hasAccess) return res.status(403).json({ error: "Forbidden" });

      // Create note using service
      const note = await noteService.createNote({
        workspaceId: req.params.workspaceId,
        userId: req.user.id,
        title: req.body.title,
        content: req.body.content,
        description: req.body.description,
        tagIds: req.body.tagIds,
      });

      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd second-brain-backend
npm install
```

### 2. Create `.env` file

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
GITHUB_APP_ID="your-github-app-id"
GITHUB_APP_SECRET="your-github-app-secret"
```

### 3. Setup Database

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

## Authentication Flow

1. **Register/Login**: User creates account or logs in
2. **JWT Token**: Server returns JWT token with user info
3. **Token Storage**: Frontend stores token in localStorage
4. **API Requests**: Frontend includes token in `Authorization: Bearer <token>` header
5. **Middleware Verification**: `authMiddleware` verifies token and extracts user info
6. **Access Verification**: Controllers check workplace access before operations

## Workspace Isolation

Each request is checked to ensure:

1. User is authenticated (has valid JWT)
2. User has access to the requested workspace
3. User has permission for the action (role-based)

```typescript
// Example: Verify access before fetching notes
const hasAccess = await workspaceService.verifyWorkspaceAccess(
  req.params.workspaceId,
  req.user.id,
);
if (!hasAccess) {
  return res.status(403).json({ error: "Forbidden" });
}
```

## Error Handling

All errors should follow this pattern:

```typescript
{
  error: "User-friendly message",
  message: "Technical details",
  code: "ERROR_CODE"
}
```

## Deployment Considerations

1. **Database**: Switch from SQLite to PostgreSQL for production
2. **Environment Variables**: Use secure storage (AWS Secrets Manager, etc.)
3. **API Keys**: Never commit API keys to repository
4. **CORS**: Configure for specific frontend domain
5. **Rate Limiting**: Add rate limiting middleware
6. **Logging**: Implement centralized logging
7. **Monitoring**: Setup error tracking (Sentry, etc.)

## Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Full-text search with Elasticsearch
- [ ] File uploads and storage integration
- [ ] OAuth2 GitHub authentication
- [ ] Audit logs for compliance
- [ ] Backup and recovery system
- [ ] Analytics and usage tracking
