export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

export type WorkspaceRole = 'owner' | 'editor' | 'viewer';
export type WorkspaceType = 'solo' | 'team';

export interface WorkspaceMember {
  user: User;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface WorkspaceActivity {
  id: string;
  type: 'note_created' | 'note_edited' | 'tag_added' | 'member_joined';
  description: string;
  user: User;
  timestamp: string;
  linkId?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  role: WorkspaceRole;
  members: WorkspaceMember[];
  activityFeed?: WorkspaceActivity[];
}

export interface NodeVersion {
  versionId: string;
  noteId: string;
  content: string;
  author: User;
  createdAt: string;
  commitMessage?: string;
}

export interface Note {
  id: string;
  workspaceId: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  backlinks: string[];
  versionCount: number;
  latestVersionId: string;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
  linkedRepositoryId?: string;
  linkedCommitSha?: string;
  linkedFilePath?: string;
}
export interface Tag {
  id: string;
  name: string;
  color: string;
}
