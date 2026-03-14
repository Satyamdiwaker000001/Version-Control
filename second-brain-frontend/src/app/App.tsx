import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
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

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

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
  const checkAuth = useAuthStore(state => state.checkAuth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize theme
      initializeTheme();
      
      // Check authentication status
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check failed:', error);
      }
      
      setIsInitialized(true);
    };

    initializeApp();
  }, [initializeTheme, checkAuth]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

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
