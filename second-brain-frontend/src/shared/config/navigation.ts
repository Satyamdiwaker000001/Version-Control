import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Tag,
  GitBranch,
  Github,
  Settings,
  User,
  Users,
} from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const mainNavigation: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Notes', path: '/editor', icon: FileText },
  { name: 'Tags', path: '/tags', icon: Tag },
  { name: 'Knowledge Graph', path: '/graph', icon: GitBranch },
];

export const workspaceNavigation: NavItem[] = [
  { name: 'Solo Workspace', path: '/workspace/solo', icon: User },
  { name: 'Team Workspace', path: '/workspace/team', icon: Users },
];

export const integrationNavigation: NavItem[] = [
  { name: 'GitHub', path: '/github', icon: Github },
];

export const systemNavigation: NavItem[] = [
  { name: 'Settings', path: '/settings', icon: Settings },
];

