# Second Brain Frontend Architecture Guide

## Overview

The frontend is built with React 19, TypeScript, Vite, TailwindCSS, and Lucide icons. It provides a modern, responsive UI inspired by Slack and GitHub with a three-column layout for collaboration.

## Project Structure

```
second-brain-frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main wrapper
│   │   ├── AppProviders.tsx           # Context providers
│   │   └── router.tsx                 # Route definitions
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── services/
│   │   │   │   └── authService.ts     # Centralized auth API
│   │   │   ├── store/
│   │   │   │   └── useAuthStore.ts
│   │   │   └── components/
│   │   ├── workspace/
│   │   │   ├── services/
│   │   │   │   └── workspaceService.ts # Workspace API
│   │   │   └── store/
│   │   │       └── useWorkspaceStore.ts
│   │   ├── notes/
│   │   │   ├── components/
│   │   │   │   ├── NotesListPage.tsx   # Main notes view
│   │   │   │   ├── NoteEditorPage.tsx  # Editor view
│   │   │   ├── services/
│   │   │   │   └── noteService.ts      # Notes API
│   │   │   ├── editor/
│   │   │   └── store/
│   │   ├── tags/
│   │   │   ├── components/
│   │   │   │   └── TagsPage.tsx        # Tag management
│   │   │   ├── services/
│   │   │   │   └── tagService.ts       # Tags API
│   │   │   └── store/
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   │   └── WorkspaceChat.tsx
│   │   │   ├── services/
│   │   │   │   └── chatService.ts      # Chat API
│   │   │   └── store/
│   │   ├── github/
│   │   │   ├── components/
│   │   │   │   ├── GithubConnectPage.tsx
│   │   │   │   ├── RepositoryDetailsPage.tsx
│   │   │   │   └── CommitTimelinePage.tsx
│   │   │   └── services/
│   │   │       └── githubService.ts    # GitHub API
│   │   ├── graph/
│   │   │   └── components/
│   │   │       └── GraphPage.tsx
│   │   ├── analytics/
│   │   │   └── components/
│   │   │       └── DashboardPage.tsx
│   │   └── settings/
│   │       └── components/
│   │           └── SettingsPage.tsx
│   ├── shared/
│   │   ├── api/
│   │   │   └── apiClient.ts            # Base axios instance
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── WorkspaceContext.tsx
│   │   │   ├── NotesContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx           # Main 3-column layout
│   │   │   ├── MainSidebar.tsx         # Left sidebar (Slack-style)
│   │   │   ├── Header.tsx              # Top navbar (GitHub-style)
│   │   │   ├── CollaborationPanel.tsx  # Right sidebar
│   │   │   ├── CommandPalette.tsx
│   │   │   └── GlobalSearch.tsx
│   │   ├── ui/
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── TagBadge.tsx
│   │   │   └── ...other UI components
│   │   ├── config/
│   │   │   └── navigation.ts            # Nav structure
│   │   ├── utils/
│   │   │   └── cn.ts                   # Utility functions
│   │   ├── types/
│   │   │   └── index.ts                # Shared types
│   │   ├── hooks/                      # Custom React hooks
│   │   └── stores/
│   │       └── useThemeStore.ts
│   ├── main.tsx                        # Vite entry
│   └── index.css
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Layout System

### Three-Column Layout

```
┌─────────────────────────────────────────────────┐
│ Left Sidebar            Header                  │
├──────────┬──────────────────────────┬──────────┤
│          │                          │          │
│ Workspace│    Main Content Area     │  Chat &  │
│ Nav      │  (Notes, Dashboard, etc) │ Activity │
│          │                          │          │
│ - New    │                          │ - Chat   │
│   Note   │                          │ - Activity
│ - Settings                          │ - Members
│          │                          │          │
└──────────┴──────────────────────────┴──────────┘
```

### Left Sidebar (MainSidebar)

- **Workspace Dropdown**: Switch between workspaces
- **Main Navigation**: Dashboard, Notes, Tags, Knowledge Graph
- **Integrations**: GitHub repositories
- **System**: Settings, Logout
- **New Note Button**: Quick action to create notes
- **Collapse/Expand**: Toggle sidebar width

### Top Header (Header)

- **Search Bar**: Search notes, commands, tags
- **Command Palette**: Ctrl+K shortcut display
- **Presence Indicators**: Show who's online
- **Live Editing**: Real-time collaboration status
- **Theme Toggle**: Dark/Light mode
- **Notifications**: Message notifications
- **User Avatar**: Profile dropdown

### Right Panel (CollaborationPanel)

- **Chat Tab**: Workspace messages (Slack-style)
- **Activity Tab**: Recent workspace activities
- **Members Tab**: Online members with status
- **Presence Status**: Online/Away/Offline indicators

## Services Architecture

### Centralized API Client

```typescript
// src/shared/api/apiClient.ts
- Base HTTP client with axios
- Auto-injects JWT token
- Handles 401 errors (redirect to login)
- Global error handling
```

### Service Modules

Each feature has its own service module for API communication:

```typescript
// noteService - Operations on notes
getNotes(workspaceId);
getNote(workspaceId, noteId);
createNote({ workspaceId, title, content });
updateNote(workspaceId, noteId, data);
deleteNote(workspaceId, noteId);
getNoteVersions(workspaceId, noteId);
shareNote(workspaceId, noteId, collaborators);

// tagService - Tag management
getTags(workspaceId);
createTag({ workspaceId, name, color });
updateTag(workspaceId, tagId, data);
deleteTag(workspaceId, tagId);

// workspaceService - Workspace operations
getWorkspaces();
createWorkspace({ name, type });
updateWorkspace(workspaceId, data);
getMembers(workspaceId);
inviteMember(workspaceId, email, role);

// chatService - Messaging
getMessages(workspaceId, limit);
sendMessage({ workspaceId, content });
editMessage(workspaceId, messageId, content);
deleteMessage(workspaceId, messageId);

// githubService - GitHub integration
connectRepository({ workspaceId, owner, repo });
getRepositories(workspaceId);
getCommits(workspaceId, repoId);
getBranches(workspaceId, repoId);
getIssues(workspaceId, repoId);

// authService - Authentication
login({ email, password });
register({ name, email, password });
getCurrentUser();
logout();
updateProfile(data);
```

## State Management

### Zustand Stores

- `useAuthStore`: Current user and auth status
- `useWorkspaceStore`: Active workspace and workspace list
- `useThemeStore`: Dark/Light mode preference
- `useChatStore`: Chat messages

### React Contexts

- `AuthContext`: Share auth state across app
- `WorkspaceContext`: Share workspace context
- `NotesContext`: Share notes state
- `ThemeContext`: Share theme preferences

## Styling

### TailwindCSS + CSS Classes

- Utility-first approach
- Dark mode support with `dark:` prefix
- Responsive design with breakpoints
- Custom theme in `tailwind.config.js`

### Component Organization

- **UI Components** (shared/ui): Reusable elements
- **Feature Components** (features/\*/components): Feature-specific
- **Layout Components** (shared/layout): App structure

## Key Features

### Notes Module

- Create, edit, delete notes
- Version history tracking
- Tag-based filtering
- Full-text search
- Share notes with collaborators
- Markdown support

### Tag System

- Create colored tags
- Tag notes for organization
- Filter notes by tags
- Edit tag colors
- View tag usage statistics

### Workspace Management

- Create personal or team workspaces
- Switch between workspaces
- Invite team members
- Manage member roles (Admin, Member, Viewer)
- Leave workspaces

### Chat/Collaboration

- Real-time workspace chat
- Message editing
- Presence indicators
- Activity feed
- Member list with status

### GitHub Integration

- Connect repositories to workspace
- View commit history
- Track branches
- Monitor issues
- Link notes to repository items

## Development Workflow

### Running Dev Server

```bash
cd second-brain-frontend
npm run dev
```

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Performance Optimizations

- Code splitting with React Router
- Lazy loading components
- Memoization with React.memo
- Virtual scrolling for long lists
- Image optimization
- Bundle size monitoring

## Browser Support

- Chrome/Edge latest
- Firefox latest
- Safari latest
- Mobile browsers

## Accessibility

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Color contrast compliance

## Testing

- Unit tests (Jest recommended)
- Component tests (React Testing Library)
- E2E tests (Playwright/Cypress)

## Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Advanced markdown editor with extensions
- [ ] Infinite scroll for notes
- [ ] Advanced search with filters
- [ ] Note templates
- [ ] Team workspaces with permissions
- [ ] Mobile app with React Native
- [ ] Offline sync capability
- [ ] Export notes to PDF/Markdown
- [ ] Integration with Slack/Discord
