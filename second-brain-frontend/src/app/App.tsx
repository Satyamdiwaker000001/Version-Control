import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useThemeStore } from '@/shared/store/useThemeStore';

// Layouts
import { AppLayout } from '@/shared/layout/AppLayout';
import { AuthLayout } from '@/shared/layout/AuthLayout';

// Pages
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import DashboardPage from '@/features/analytics/components/DashboardPage';
import NoteEditorPage from '@/features/notes/components/NoteEditorPage';
import GraphPage from '@/features/graph/components/GraphPage';
import GithubConnectPage from '@/features/github/components/GithubConnectPage';
import RepositoryDetailsPage from '@/features/github/components/RepositoryDetailsPage';
import CommitTimelinePage from '@/features/github/components/CommitTimelinePage';
import TagsPage from '@/features/tags/components/TagsPage';
import SettingsPage from '@/features/settings/components/SettingsPage';
import { ProjectPage } from '@/features/projects/components/ProjectPage';

// Store
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <>
      <Toaster position="bottom-right" richColors theme="system" />
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<AuthLayout />}>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
          </Route>
          
          {/* Protected Area Routes */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/editor" element={<NoteEditorPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/github" element={<GithubConnectPage />} />
            <Route path="/repository/:id" element={<RepositoryDetailsPage />} />
            <Route path="/repository/:id/commits" element={<CommitTimelinePage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/projects" element={<ProjectPage />} />
            <Route path="/settings/:tab?" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
