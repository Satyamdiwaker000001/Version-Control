import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';

const AuthErrorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const errorMessage = searchParams.get('message') || 'Authentication failed';

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/login');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.233V11.25c0-1.065-.692-1.983-1.653-2.884m0 0a3.002 3.002 0 0 0 1.447-2.527m0 0A3.002 3.002 0 0 0 12.061 6.717M12 21v-7m0 0a3 3 0 0 1-6 0m6 0v7m0 0a3 3 0 0 1-6 0" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
          Authentication Failed
        </h1>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-300 text-sm">
            {errorMessage}
          </p>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          We couldn't complete your GitHub authentication. Please try again.
        </p>

        <div className="space-y-3">
          <Button onClick={() => navigate('/github')} className="w-full">
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-4">
          You will be redirected to the login page automatically in 10 seconds.
        </p>
      </div>
    </div>
  );
};

export default AuthErrorPage;
