import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

const AuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // In a real app, we'd fetch the user profile here with the token
      // For now, we'll use a temporary user object and then call checkAuth 
      // which will fetch the real user from /auth/me
      localStorage.setItem('authToken', token);
      
      const finalizeAuth = async () => {
        try {
          await checkAuth();
          toast.success('Successfully authenticated with GitHub');
          navigate('/github');
        } catch (error) {
          console.error('Finalize auth failed:', error);
          toast.error('Failed to complete authentication');
          navigate('/login');
        }
      };

      finalizeAuth();
    } else {
      toast.error('Authentication failed: No token received');
      navigate('/login');
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Completing authentication...</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Please wait while we sync your account.</p>
      </div>
    </div>
  );
};

export default AuthSuccessPage;
