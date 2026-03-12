# Second Brain - Frontend Architecture & Implementation Guide

## Completed Infrastructure

### ✅ API Integration

- **apiClient.ts** - Centralized Axios instance with:
  - Automatic token injection
  - 401 redirect handling
  - Error normalization
  - Consistent response format

### ✅ Service Layer

- **authService.ts** - Authentication API wrapper with:
  - Register/Login/Logout
  - Token management
  - Local storage persistence
  - Profile updates

### ✅ State Management

- **useAuthStore** (Zustand) - Global auth state:
  - User state
  - Auth status
  - Loading states
  - Async actions (login, register, checkAuth)

### ✅ Shared Types

- User, AuthResponse interfaces
- Exported from `@/shared/types`
- Consistent with backend types

## Architecture Overview

```
src/
  app/
    App.tsx              - Main app component
  features/
    auth/
      services/          - API integration
      store/             - Zustand stores
      components/        - Auth UI
      pages/             - Login, Register
    workspace/
      services/
      store/
      components/
    notes/
      services/
      store/
      components/
    chat/
      services/
      store/
      components/
    github/
      services/
      components/
  shared/
    api/                 - API client
    types/               - Type definitions
    ui/                  - Reusable components
    layout/              - App layouts
    hooks/               - Custom React hooks
    utils/               - Utilities
    store/               - Global stores
```

## Frontend Features to Implement

### 1. Authentication (Phase 1)

**Components:**

- [ ] LoginPage - Email/password login form
- [ ] RegisterPage - Registration form
- [ ] ProtectedRoute - Route guard component
- [ ] AuthLayout - Auth page layout

**Implementation:**

```typescript
// Example LoginPage structure
function LoginPage() {
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (formData) => {
    await login(formData.email, formData.password);
    navigate('/dashboard');
  };

  return (/* Form JSX */);
}
```

### 2. Workspace Management (Phase 2)

**Services needed:**

- workspaceService (mirroring backend)
- useWorkspaceStore

**Features:**

- [ ] Create workspace
- [ ] List workspaces
- [ ] Switch workspaces
- [ ] Manage members
- [ ] Workspace settings

### 3. Notes System (Phase 3)

**Services:**

- noteService
- useNoteStore

**Components:**

- [ ] NoteEditor - Markdown editor with preview
- [ ] NoteList - All notes in workspace
- [ ] NoteVersions - Version history viewer
- [ ] NoteMetadata - Tags, metadata panel

### 4. Chat System (Phase 4)

**Services:**

- chatService
- useChatStore

**Features:**

- [ ] Channel list and creation
- [ ] Message sending/editing/deleting
- [ ] Message threading
- [ ] Emoji reactions
- [ ] Real-time updates (WebSocket)

### 5. UI System (Parallel)

**Components in `src/shared/ui/`:**

- [ ] Button - Primary, secondary, variants
- [ ] Input - Text input with validation
- [ ] Card - Container component
- [ ] Modal - Dialog component
- [ ] Sidebar - Navigation sidebar
- [ ] Navbar - Top navigation
- [ ] CommandPalette - Cmd+K search
- [ ] Avatar - User avatars
- [ ] Badge - Status badges
- [ ] Dropdown - Dropdown menus

### 6. Layouts (Phase 1)

**Files:**

- [ ] AppLayout - 3-column layout (sidebar, main, chat)
- [ ] AuthLayout - Auth pages layout
- [ ] Sidebar - Workspace navigation
- [ ] Header - Top navbar with search/user menu

## Service Layer Pattern (Frontend)

Each feature has a service that mirrors backend API:

```typescript
// services/workspaceService.ts
export const workspaceService = {
  async createWorkspace(input: CreateWorkspaceInput) {
    return apiClient.post("/workspaces", input);
  },

  async listWorkspaces() {
    return apiClient.get("/workspaces");
  },
  // ... etc
};

// In components:
const workspaces = await workspaceService.listWorkspaces();
```

## Zustand Store Pattern

```typescript
export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  // State
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,

  // Actions
  loadWorkspaces: async () => {
    set({ isLoading: true });
    const data = await workspaceService.listWorkspaces();
    set({ workspaces: data, isLoading: false });
  },
}));

// In components:
const { workspaces, loadWorkspaces } = useWorkspaceStore();
```

## Environment Configuration

Create `.env.local`:

```
VITE_API_URL=http://localhost:5000/api
VITE_GITHUB_CLIENT_ID=your_client_id
```

## Next Implementation Steps

1. **Create UI Component Library**
   - Use shadcn/ui or custom Tailwind components
   - Ensure consistency with design system
   - Export from `src/shared/ui/`

2. **Build Layout System**
   - AppLayout (3-column)
   - Sidebar with channels/notes/workspaces
   - Top navbar

3. **Implement Auth Flow**
   - Protected routes
   - Login/Register pages
   - Auth state initialization

4. **Build Workspace Features**
   - Workspace switcher
   - Member management
   - Dashboard page

5. **Notes Editor**
   - Markdown editor
   - Preview mode
   - Tag selection
   - Version history browser

6. **Chat System**
   - Channel navigation
   - Message list
   - Message input
   - Thread replies

7. **Real-time Features**

- Socket.IO connection
- Live message updates
- User presence indicators
- Typing indicators

8. **Advanced Features**
   - Knowledge graph visualization
   - Global search
   - Command palette (Cmd+K)
   - Notifications
   - GitHub integration UI

## Key Development Principles

1. **Service Layer First** - All API calls through services
2. **Zustand for Global State** - Use for workspace, user, sidebar state
3. **React Hooks for Local State** - useState, useCallback, etc
4. **Error Handling** - Toast notifications via sonner
5. **Type Safety** - Full TypeScript coverage
6. **Responsive Design** - Mobile-first Tailwind CSS

## Testing

- Component tests with Vitest
- E2E tests with Playwright/Cypress
- API mocking with Mock Service Worker

## Performance Tips

- Code splitting by feature
- Lazy load routes
- Memoize heavy components
- Use React.memo for lists
- Virtual scrolling for large lists
- Image optimization

## Common Gotchas

1. **Auth token not persisting** - Check localStorage key names match backend
2. **CORS errors** - Ensure backend CORS config matches frontend URL
3. **State updates in closed component** - Use cleanup in useEffect
4. **Missing API headers** - Token must be in Authorization header
5. **URL path issues** - Use `import.meta.env.VITE_API_URL`

## Resources

- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tawind CSS](https://tailwindcss.com)
- [lucide-react Icons](https://lucide.dev)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)

---

**Backend API:** [See Backend API.md](../second-brain-backend/API.md)
