import type { ReactNode } from 'react';

import { AuthProvider } from '@/shared/contexts/AuthContext';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { WorkspaceProvider } from '@/shared/contexts/WorkspaceContext';
import { NotesProvider } from '@/shared/contexts/NotesContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <WorkspaceProvider>
          <NotesProvider>{children}</NotesProvider>
        </WorkspaceProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};