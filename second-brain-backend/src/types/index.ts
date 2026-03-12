// Shared Types for Second Brain Platform

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  githubUsername: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================
// Workspace Types
// ============================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: "solo" | "team";
  avatar: string | null;
  description: string | null;
  githubOwner: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: "owner" | "admin" | "member";
  user?: User;
  joinedAt: Date;
}

export interface CreateWorkspaceInput {
  name: string;
  type: "solo" | "team";
  description?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  avatar?: string;
}

// ============================================
// Note Types
// ============================================

export interface Note {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  content: string;
  description: string | null;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
  tags?: Tag[];
}

export interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  version: number;
  createdAt: Date;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  description?: string;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  description?: string;
  isPublic?: boolean;
  isPinned?: boolean;
  tagIds?: string[];
}

// ============================================
// Tag Types
// ============================================

export interface Tag {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  emoji: string | null;
  description: string | null;
  createdAt: Date;
}

export interface CreateTagInput {
  name: string;
  color?: string;
  emoji?: string;
  description?: string;
}

export interface UpdateTagInput {
  name?: string;
  color?: string;
  emoji?: string;
  description?: string;
}

// ============================================
// Repository Types
// ============================================

export interface Repository {
  id: string;
  workspaceId: string;
  name: string;
  owner: string;
  url: string;
  description: string | null;
  isPrivate: boolean;
  language: string | null;
  stars: number;
  lastSyncedAt: Date | null;
  createdAt: Date;
}

export interface CreateRepositoryInput {
  name: string;
  owner: string;
  url: string;
  description?: string;
  isPrivate?: boolean;
}

// ============================================
// Channel & Message Types
// ============================================

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  workspaceId: string;
  channelId: string | null;
  noteId: string | null;
  userId: string;
  content: string;
  parentMessageId: string | null;
  reactions: Record<string, string[]> | null;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
}

export interface CreateChannelInput {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface CreateMessageInput {
  content: string;
  parentMessageId?: string;
}

// ============================================
// User Presence Types
// ============================================

export interface UserPresence {
  id: string;
  userId: string;
  workspaceId: string;
  status: "online" | "away" | "offline";
  lastActivityAt: Date;
  user?: User;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Error Types
// ============================================

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ============================================
// Validation Schemas (using Zod)
// ============================================

export const LoginSchema = {
  email: "string",
  password: "string",
};

export const RegisterSchema = {
  email: "string",
  password: "string",
  name: "string",
};

export const CreateNoteSchema = {
  title: "string",
  content: "string",
  description: "string|optional",
  tagIds: "string[]|optional",
};
